import produitModel from "../models/produitModel.js"; // Ajuste le chemin selon ton projet
import categorieModel from "../models/categorieModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Récupérer tous les produits et catégories
        const produits = await produitModel.find({});
        const categories = await categorieModel.find({});

        // 2. Calculs généraux
        const totalProduits = produits.length;
        const totalCategories = categories.length;

        // 3. Calcul de la valeur totale du stock (Prix * Quantité)
        let valeurTotaleStock = 0;
        let alertesStockCritique = 0;

        // Structure pour compter les produits par catégorie
        const repartitionCategories = {};
        // Initialisation avec toutes les catégories existantes à 0
        categories.forEach(cat => {
            repartitionCategories[cat.nom] = 0;
        });

        produits.forEach(prod => {
            // Valeur du stock
            const qte = prod.stock || prod.quantite || 0;
            const prix = prod.prix || 0;
            valeurTotaleStock += (prix * qte);

            // Alerte si le stock est inférieur ou égal à 3 (seuil personnalisable)
            if (qte <= 3) {
                alertesStockCritique++;
            }

            // Répartition par catégorie (liaison par ID ou par nom selon ton modèle)
            // Si ton produit stocke l'ID de la catégorie :
            const categorieTrouvee = categories.find(c => c._id.toString() === prod.categorie?.toString());
            if (categorieTrouvee) {
                repartitionCategories[categorieTrouvee.nom]++;
            } else if (prod.categorie) {
                // Si tu stockes directement le nom en string
                repartitionCategories[prod.categorie] = (repartitionCategories[prod.categorie] || 0) + 1;
            }
        });

        // 4. Préparer les données pour le graphique de répartition
        const chartDataCategories = {
            labels: Object.keys(repartitionCategories),
            series: Object.values(repartitionCategories)
        };

        // 5. Récupérer les 5 produits avec le stock le plus bas
        const produitsStockBas = produits
            .sort((a, b) => (a.stock || 0) - (b.stock || 0))
            .slice(0, 5)
            .map(p => ({
                nom: p.nom,
                stock: p.stock || p.quantite || 0,
                prix: p.prix
            }));

        res.status(200).json({
            success: true,
            stats: {
                totalProduits,
                totalCategories,
                valeurTotaleStock,
                alertesStockCritique,
                chartDataCategories,
                produitsStockBas
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur stats dashboard", error: error.message });
    }
};