import produitModel from "../models/produitModel.js";
import categorieModel from "../models/categorieModel.js";
import orderModel from "../models/orderModel.js"; // Importation de ton orderModel

export const getDashboardStats = async (req, res) => {
    try {
        // 1. CALCULS PARALLÈLES SUR LA BDD
        const [
            totalProduits, 
            totalCategories, 
            rupturesStock, 
            totalCoupsDeCoeur,
            commandesStats,
            bestSellersAggregation,
            zonesAggregation
        ] = await Promise.all([
            // Totaux catalogue
            produitModel.countDocuments({}),
            categorieModel.countDocuments({}),
            produitModel.countDocuments({ enStock: false }),
            produitModel.countDocuments({ meilleurVente: true }),

            // Chiffre d'Affaires & Nombre de commandes validées (exclut les "Annulé")
            orderModel.aggregate([
                { $match: { status: { $ne: "Annulé" } } }, 
                { 
                    $group: { 
                        _id: null, 
                        totalCA: { $sum: "$amount" },
                        count: { $sum: 1 }
                    } 
                }
            ]),

            // Top 5 des bijoux les plus vendus (Aggregation sur `items`)
            orderModel.aggregate([
                { $match: { status: { $ne: "Annulé" } } },
                { $unwind: "$items" },
                { 
                    $group: { 
                        _id: "$items._id", 
                        totalVentes: { $sum: "$items.quantity" },
                        totalGenere: { $sum: { $multiply: ["$items.quantity", "$items.prix"] } }
                    } 
                },
                { $sort: { totalVentes: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "produits", // Assure-toi que la collection s'appelle "produits" dans MongoDB
                        localField: "_id",
                        foreignField: "_id",
                        as: "details"
                    }
                },
                { $unwind: "$details" }
            ]),

            // Top zones / villes de livraison (`address.city`)
            orderModel.aggregate([
                { $match: { status: { $ne: "Annulé" } } },
                { 
                    $group: { 
                        _id: "$address.city", 
                        total: { $sum: 1 } 
                    } 
                },
                { $sort: { total: -1 } },
                { $limit: 5 }
            ])
        ]);

        // 2. EXTRACTION ET FORMATAGE DU CA ET TOTAL COMMANDES
        const chiffreAffairesTotal = commandesStats.length > 0 ? commandesStats[0].totalCA : 0;
        const totalCommandes = commandesStats.length > 0 ? commandesStats[0].count : 0;

        // 3. FORMATAGE DES BIJOUX LES PLUS VENDUS
        const produitsPlusVendus = bestSellersAggregation.map(item => ({
            nom: item.details.nom,
            ventes: item.totalVentes,
            totalGenere: item.totalGenere
        }));

        // 4. RÉCUPÉRATION DES COUPS DE CŒUR DU CATALOGUE
        const coupsDeCoeurList = await produitModel.find({ meilleurVente: true })
            .limit(5)
            .select("nom categorie")
            .populate("categorie", "nom");

        const produitsPlusFavoris = coupsDeCoeurList.map(p => ({
            nom: p.nom,
            categorie: p.categorie?.nom || "Bijoux",
            favorisCount: "Vedette"
        }));

        // 5. FORMATAGE DU CLASSEMENT DES VILLES
        const zonesPlusDemandees = zonesAggregation.map(z => ({
            zone: z._id || "Non spécifiée",
            total: z.total
        }));

        const zoneTop = zonesPlusDemandees.length > 0 ? zonesPlusDemandees[0].zone : "N/A";

        // 6. RETOUR DE LA RÉPONSE POUR LE DASHBOARD
        return res.status(200).json({
            success: true,
            stats: {
                chiffreAffairesTotal,
                totalCoupsDeCoeur,
                totalCommandes,
                zoneTop,
                produitsPlusVendus,
                produitsPlusFavoris,
                zonesPlusDemandees,
                totalProduits,
                totalCategories,
                rupturesStock
            }
        });

    } catch (error) {
        console.error("Erreur Dashboard Stats Réelles:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Erreur lors du calcul des statistiques réelles", 
            error: error.message 
        });
    }
};