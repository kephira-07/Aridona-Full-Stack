import orderModel from '../models/orderModel.js';
import userModel from '../models/utilisateurModel.js';

// Placer une commande classique (Espèces ou virement en attente)
const placeOrder = async (req, res) => {
    try {
  
        let { userId, items, amount, address } = req.body;

        // 🛡️ SÉCURITÉ ROBUSTE : Si le middleware a échoué à fournir le userId, 
        // on tente de le récupérer nous-mêmes depuis l'en-tête de la requête
        if (!userId) {
            const token = req.headers.token || req.headers.authorization?.split(" ")[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id; // On extrait l'ID contenu dans ton jeton JWT
            }
        }

        // Si après ça, il n'y a TOUJOURS pas de userId, on bloque proprement sans faire crasher le serveur
        if (!userId) {
            return res.status(401).json({ success: false, message: "Session expirée ou utilisateur non authentifié." });
        }

        // --- Reste de tes validations ---
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Le panier est vide." });
        }
        // ... (conserve le reste de ton code de sauvegarde identique)

        // Préparation de l'objet de commande (les items contiennent déjà l'URL de l'image transmis par le front client)
        const orderData = {
            userId,
            items, // Contient [{ _id, nom, prix, size, quantity, image: [...] }]
            address,
            amount,
            paymentMethod: "Manuel",
            payment: false,
            status: "Commande passée",
            date: Date.now()
        };

        // Sauvegarde de la commande en base de données
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Nettoyage sécurisé du panier de l'utilisateur après commande réussie
        await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });

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