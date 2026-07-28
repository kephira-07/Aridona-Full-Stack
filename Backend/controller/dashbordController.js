import produitModel from "../models/produitModel.js";
import categorieModel from "../models/categorieModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Comptages globaux
        const [totalProduits, totalCategories, rupturesStock, meilluresVentes] = await Promise.all([
            produitModel.countDocuments({}),
            categorieModel.countDocuments({}),
            produitModel.countDocuments({ enStock: false }),
            produitModel.countDocuments({ meilleurVente: true })
        ]);

        // 2. Récupérer des bijoux pour alimenter les listes temporairement
        const produits = await produitModel.find({}).limit(5).select("nom prix categorie image");

        // Formatage pour le composant React DashboardStats
        const produitsPlusVendusFormatted = produits.map((p, idx) => ({
            nom: p.nom,
            ventes: (5 - idx) * 3,
            totalGenere: p.prix * ((5 - idx) * 3)
        }));

        const produitsPlusFavorisFormatted = produits.map((p) => ({
            nom: p.nom,
            categorie: p.categorie ? p.categorie.toString() : "Bijoux",
            favorisCount: Math.floor(Math.random() * 20) + 1
        }));

        return res.status(200).json({
            success: true,
            stats: {
                // Métriques principales
                chiffreAffairesTotal: 1500000, 
                totalCoupsDeCoeur: meilluresVentes,
                totalCommandes: 24,
                zoneTop: "Lomé / Maritime",

                // Données pour les tableaux et graphiques
                produitsPlusVendus: produitsPlusVendusFormatted,
                produitsPlusFavoris: produitsPlusFavorisFormatted,
                zonesPlusDemandees: [
                    { zone: "Lomé Centre", total: 42 },
                    { zone: "Baguidi", total: 28 },
                    { zone: "Agoè-Nyivé", total: 19 },
                    { zone: "Kara", total: 8 }
                ],

                // Autres données secondaires
                totalProduits,
                totalCategories,
                rupturesStock
            }
        });

    } catch (error) {
        console.error("Erreur Dashboard Stats:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des statistiques", 
            error: error.message 
        });
    }
};