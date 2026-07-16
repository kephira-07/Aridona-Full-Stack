import orderModel from '../models/orderModel.js';
import userModel from '../models/utilisateurModel.js';
import jwt from 'jsonwebtoken';

// Placer une commande (Authentifié OU Invité)
const placeOrder = async (req, res) => {
    try {
        let { userId, items, amount, address } = req.body;

        // Si l'utilisateur est connecté, on extrait son ID du token s'il existe
        if (!userId) {
            const token = req.headers.token || req.headers.authorization?.split(" ")[1];
            if (token && token !== "null" && token !== "undefined") {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.id;
                } catch (jwtErr) {
                    // Si le token est invalide mais qu'on accepte les invités,
                    // on ne bloque pas, on ignore juste le token corrompu
                    console.log("Token invalide ignoré pour achat invité");
                }
            }
        }

        // Si TOUJOURS pas de userId (cas d'un invité non connecté)
        // On lui attribue une étiquette "guest" ou "invite" en base de données
        if (!userId) {
            userId = "guest_order"; 
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Le panier est vide." });
        }

        const orderData = {
            userId, // Sera soit l'ID utilisateur réel, soit "guest_order"
            items, 
            address,
            amount,
            paymentMethod: req.body.paymentMethod || "Manuel",
            payment: false,
            status: "Commande passée",
            date: Date.now()
        };

        // Sauvegarde de la commande en base de données
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Si l'utilisateur était connecté, on nettoie son panier en BDD
        if (userId !== "guest_order") {
            await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });
        }

        return res.status(201).json({ success: true, message: "Commande enregistrée avec succès ! ✨" });
    } catch (error) {
        console.error("Erreur PlaceOrder:", error);
        return res.status(500).json({ success: false, message: "Erreur interne lors de la création de la commande." });
    }
};
// Récupérer TOUTES les commandes (Pour le Panel Admin)
const allOrders = async (req, res) => {
    try {
        // On récupère toutes les commandes triées de la plus récente à la plus ancienne
        const orders = await orderModel.find({}).sort({ date: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Erreur AllOrders:", error);
        return res.status(500).json({ success: false, message: "Impossible de récupérer les commandes." });
    }
};

// Mettre à jour le statut logistique d'une commande (Pour le Panel Admin)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const validStatuses = ["Commande passée", "En cours de préparation", "Expédié", "Livré"];

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "ID de commande et statut requis." });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Statut logistique non valide." });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Commande introuvable." });
        }

        return res.status(200).json({ success: true, message: "Statut logistique mis à jour avec succès ! ✅" });
    } catch (error) {
        console.error("Erreur UpdateStatus:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du statut." });
    }
};

export { placeOrder, allOrders, updateStatus };