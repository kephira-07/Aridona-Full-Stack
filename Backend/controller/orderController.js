import orderModel from '../models/orderModel.js';
import userModel from '../models/utilisateurModel.js';
import produitModel from '../models/produitModel.js';
import jwt from 'jsonwebtoken';

// Frais de livraison forfaitaire — doit rester synchronisé avec `delivery_free`
// dans client/src/context/ShopContext.jsx. Recalculé ici, jamais fait confiance au client.
const FRAIS_LIVRAISON = 500;

// 1. Placer une commande (Authentifié OU Invité)
const placeOrder = async (req, res) => {
    try {
        const { items, address, paymentMethod } = req.body;
        let userId = null; // null = commande invité

        // Extraction sécurisée du userId depuis le Token JWT (si présent)
        const token = req.headers.token || req.headers.authorization?.split(" ")[1];
        if (token && token !== "null" && token !== "undefined") {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (jwtErr) {
                console.warn("Token invalide ou expiré, passage en commande invité.");
            }
        }

        // Validation des éléments requis
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Votre panier est vide." });
        }

        if (!address || !address.firstName || !address.phone || !address.street) {
            return res.status(400).json({ success: false, message: "Les informations de livraison sont incomplètes." });
        }

        // 🛡️ SÉCURISATION DU PRIX : Recalcul obligatoire du montant total depuis la base de données
        let calculatedAmount = 0;
        const verifiedItems = [];

        for (const item of items) {
            const productDB = await produitModel.findById(item._id);
            if (!productDB) {
                return res.status(404).json({ success: false, message: `Le bijou avec l'ID ${item._id} n'existe plus.` });
            }

            const itemPrice = Number(productDB.prix || productDB.price || 0);
            const quantity = Number(item.quantity) || 1;
            calculatedAmount += itemPrice * quantity;

            // orderModel attend image: [String] — produitModel stocke désormais des objets
            // {url, publicId, alt}, donc on n'en extrait que l'URL pour l'instantané de commande.
            const imageUrls = (productDB.image || []).map((img) =>
                typeof img === 'object' && img?.url ? img.url : img
            );

            verifiedItems.push({
                _id: productDB._id,
                nom: productDB.nom || productDB.name,
                prix: itemPrice,
                // Supporte 'size' ou 'sizes' selon l'objet envoyé par le Frontend
                size: item.size || item.sizes || "Standard",
                quantity,
                image: imageUrls
            });
        }

        // Le sous-total seul ne reflète pas ce que le client voit/paie réellement (WhatsApp
        // affiche sous-total + frais de livraison) — il faut inclure les frais ici aussi.
        const fraisLivraison = calculatedAmount > 0 ? FRAIS_LIVRAISON : 0;
        const montantTotal = calculatedAmount + fraisLivraison;

        const orderData = {
            userId,
            items: verifiedItems,
            address,
            amount: montantTotal, // Prix recalculé côté serveur, frais de livraison inclus
            paymentMethod: paymentMethod || "Manuel",
            payment: false,
            status: "Commande passée"
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Réinitialiser le panier BDD si l'utilisateur est authentifié
        if (userId) {
            await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });
        }

        return res.status(201).json({ 
            success: true, 
            message: "Commande enregistrée avec succès ! ✨", 
            orderId: newOrder._id 
        });

    } catch (error) {
        console.error("Erreur PlaceOrder:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la création de la commande.", error: error.message });
    }
};

// 2. Récupérer les commandes d'un utilisateur connecté (Espace Client)
const userOrders = async (req, res) => {
    try {
        // Double sécurité d'injection middleware (req.userId ou req.body.userId)
        const userId = req.userId || req.body.userId; 
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Utilisateur non identifié." });
        }

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Erreur UserOrders:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la récupération de vos commandes." });
    }
};

// 3. Récupérer TOUTES les commandes (Panel Admin)
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Erreur AllOrders:", error);
        return res.status(500).json({ success: false, message: "Impossible de récupérer la liste des commandes." });
    }
};

// 4. Mettre à jour le statut d'une commande (Panel Admin)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const validStatuses = ["Commande passée", "En cours de préparation", "Expédié", "Livré", "Annulé"];

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "ID de commande et statut requis." });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Statut logistique non valide." });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Commande introuvable." });
        }

        return res.status(200).json({ success: true, message: "Statut logistique mis à jour ! ✅", order: updatedOrder });
    } catch (error) {
        console.error("Erreur UpdateStatus:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du statut." });
    }
};

export { placeOrder, userOrders, allOrders, updateStatus };