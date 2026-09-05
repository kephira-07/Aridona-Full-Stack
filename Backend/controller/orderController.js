import orderModel from '../models/orderModel.js';
import userModel from '../models/utilisateurModel.js';
import produitModel from '../models/produitModel.js';
import packModel from '../models/packModel.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { FRAIS_LIVRAISON } from '../config/siteConfig.js';

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

        if (items.length > 50) {
            return res.status(400).json({ success: false, message: "La commande contient trop d'articles." });
        }

        // Deux natures de lignes possibles dans le panier : produit classique ou pack composé.
        const produitLignes = items.filter((item) => item?.type !== 'pack');
        const packLignes = items.filter((item) => item?.type === 'pack');

        const produitIds = produitLignes.map((item) => item?._id);
        const packIds = packLignes.map((item) => item?._id);
        if (produitIds.some((id) => !mongoose.isValidObjectId(id)) || packIds.some((id) => !mongoose.isValidObjectId(id))) {
            return res.status(400).json({ success: false, message: 'Identifiant invalide dans le panier.' });
        }

        // Les packs ne réservent pas un stock propre : ils consomment le stock réel de leurs
        // produits composants (multiplié par la quantité de pack commandée).
        const packs = packIds.length > 0
            ? await packModel.find({ _id: { $in: packIds }, actif: true }).populate('produits.produit')
            : [];
        const packsById = new Map(packs.map((pack) => [String(pack._id), pack]));

        const produitIdsAVerifier = new Set(produitIds.map(String));
        for (const packLigne of packLignes) {
            const pack = packsById.get(String(packLigne?._id));
            if (!pack) continue;
            for (const composant of pack.produits) {
                if (composant.produit) produitIdsAVerifier.add(String(composant.produit._id));
            }
        }

        // 🛡️ SÉCURISATION DU PRIX : Recalcul obligatoire du montant total depuis la base de données
        let calculatedAmount = 0;
        const verifiedItems = [];

        const products = await produitModel.find({ _id: { $in: [...produitIdsAVerifier] } });
        const productsById = new Map(products.map((product) => [String(product._id), product]));
        const quantitiesByProduct = new Map();

        for (const item of produitLignes) {
            const productDB = productsById.get(String(item?._id));
            if (!productDB) {
                return res.status(404).json({ success: false, message: `Le bijou avec l'ID ${item._id} n'existe plus.` });
            }

            if (productDB.enStock === false) {
                return res.status(409).json({ success: false, message: `${productDB.nom} est en rupture de stock.` });
            }

            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
                return res.status(400).json({ success: false, message: 'Quantité invalide.' });
            }
            quantitiesByProduct.set(
                String(productDB._id),
                (quantitiesByProduct.get(String(productDB._id)) || 0) + quantity
            );

            const requestedSize = item.size || item.sizes;
            if (requestedSize && productDB.sizes.length > 0 && !productDB.sizes.includes(requestedSize)) {
                return res.status(400).json({ success: false, message: `Taille invalide pour ${productDB.nom}.` });
            }

            const itemPrice = Number(productDB.prix || productDB.price || 0);
            calculatedAmount += itemPrice * quantity;

            // orderModel attend image: [String] — produitModel stocke désormais des objets
            // {url, publicId, alt}, donc on n'en extrait que l'URL pour l'instantané de commande.
            const imageUrls = (productDB.image || []).map((img) =>
                typeof img === 'object' && img?.url ? img.url : img
            );

            verifiedItems.push({
                _id: productDB._id,
                type: 'produit',
                nom: productDB.nom || productDB.name,
                prix: itemPrice,
                // Supporte 'size' ou 'sizes' selon l'objet envoyé par le Frontend
                size: item.size || item.sizes || "Standard",
                quantity,
                image: imageUrls
            });
        }

        for (const item of packLignes) {
            const pack = packsById.get(String(item?._id));
            if (!pack) {
                return res.status(404).json({ success: false, message: "Un pack de votre panier n'existe plus ou n'est plus disponible." });
            }

            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
                return res.status(400).json({ success: false, message: 'Quantité invalide.' });
            }

            for (const composant of pack.produits) {
                const productDB = composant.produit && productsById.get(String(composant.produit._id));
                if (!productDB) {
                    return res.status(404).json({ success: false, message: `Le pack « ${pack.nom} » contient un bijou qui n'existe plus.` });
                }
                if (productDB.enStock === false) {
                    return res.status(409).json({ success: false, message: `${productDB.nom} (dans le pack « ${pack.nom} ») est en rupture de stock.` });
                }
                const quantiteNecessaire = composant.quantite * quantity;
                quantitiesByProduct.set(
                    String(productDB._id),
                    (quantitiesByProduct.get(String(productDB._id)) || 0) + quantiteNecessaire
                );
            }

            const itemPrice = Number(pack.prix);
            calculatedAmount += itemPrice * quantity;

            const imagePrincipale = pack.produits
                .map((composant) => composant.produit?.image?.[0])
                .find((img) => img?.url);

            verifiedItems.push({
                _id: pack._id,
                type: 'pack',
                nom: pack.nom,
                prix: itemPrice,
                size: 'Coffret',
                quantity,
                image: imagePrincipale ? [imagePrincipale.url] : []
            });
        }

        const reservedProducts = [];
        try {
            for (const [productId, quantity] of quantitiesByProduct) {
                const productDB = productsById.get(productId);
                if (productDB.stock === null || productDB.stock === undefined) continue;

                const reserved = await produitModel.findOneAndUpdate(
                    { _id: productId, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                );
                if (!reserved) {
                    const stockError = new Error(`${productDB.nom} n'a plus assez de stock.`);
                    stockError.statusCode = 409;
                    throw stockError;
                }
                reservedProducts.push({ productId, quantity });
            }
        } catch (error) {
            await Promise.all(reservedProducts.map(({ productId, quantity }) =>
                produitModel.findByIdAndUpdate(productId, { $inc: { stock: quantity } })
            ));
            if (error.statusCode === 409) {
                return res.status(409).json({ success: false, message: error.message });
            }
            throw error;
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
        try {
            await newOrder.save();
        } catch (error) {
            await Promise.all(reservedProducts.map(({ productId, quantity }) =>
                produitModel.findByIdAndUpdate(productId, { $inc: { stock: quantity } })
            ));
            throw error;
        }

        await Promise.all(reservedProducts.map(({ productId }) =>
            produitModel.updateOne(
                { _id: productId, stock: 0 },
                { $set: { enStock: false } }
            )
        ));

        // Réinitialiser le panier BDD (produits + packs) si l'utilisateur est authentifié
        if (userId) {
            await userModel.findByIdAndUpdate(userId, { $set: { cartData: {}, cartPacks: {} } });
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