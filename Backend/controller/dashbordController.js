import produitModel from "../models/produitModel.js";
import categorieModel from "../models/categorieModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Exécution des comptages globaux en parallèle
        const [totalProduits, totalCategories, rupturesStock, meilluresVentes] = await Promise.all([
            produitModel.countDocuments({}),
            categorieModel.countDocuments({}),
            produitModel.countDocuments({ enStock: false }),
            produitModel.countDocuments({ meilleurVente: true })
        ]);

        // 2. Répartition des produits par catégorie via Agrégation MongoDB ($lookup + $group)
        const repartitionCategoriesRaw = await produitModel.aggregate([
            {
                $group: {
                    _id: "$categorie",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "categories", // Nom de la collection MongoDB pour le modèle 'categorie'
                    localField: "_id",
                    foreignField: "_id",
                    as: "detailsCategorie"
                }
            },
            {
                $unwind: {
                    path: "$detailsCategorie",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    nomCategorie: { $ifNull: ["$detailsCategorie.nom", "Non catégorisé"] },
                    count: 1
                }
            }
        ]);

        // Formater les données pour ApexCharts / Chart.js
        const chartDataCategories = {
            labels: repartitionCategoriesRaw.map(item => item.nomCategorie),
            series: repartitionCategoriesRaw.map(item => item.count)
        };

        // 3. Récupérer les 5 derniers produits ajoutés
        const derniersProduits = await produitModel.find({})
            .select("nom prix enStock image createdAt")
            .populate("categorie", "nom")
            .sort({ createdAt: -1 })
            .limit(5);

        // 4. Envoi de la réponse formatée
        return res.status(200).json({
            success: true,
            stats: {
                totalProduits,
                totalCategories,
                rupturesStock,        // Nombre de bijoux en rupture
                meilluresVentes,      // Nombre de bijoux "Coup de cœur / Meilleure vente"
                chartDataCategories,  // { labels: [...], series: [...] }
                derniersProduits      // Aperçu des récents ajouts
            }
        });

    } catch (error) {
        console.error("Erreur Dashboard Stats:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des statistiques du tableau de bord", 
            error: error.message 
        });
    }
};