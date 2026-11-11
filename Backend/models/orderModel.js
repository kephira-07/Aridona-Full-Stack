import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['produit', 'pack'], default: 'produit' },
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    size: { type: String, required: true, default: "Standard" },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: [String], required: true }
}, { _id: false });

const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    street: { type: String, required: true, trim: true }, // Quartier / repère
    city: { type: String, required: true, trim: true, default: 'Lomé' },
    zipcode: { type: String, default: '00228', trim: true },
    phone: { type: String, required: true, trim: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    // null = commande passée en tant qu'invité (pas de compte au moment de l'achat)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateur', default: null, index: true },
    items: { type: [itemSchema], required: true },
    address: { type: addressSchema, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { 
        type: String, 
        required: true, 
        enum: ["À la livraison", "Mobile Money", "COD", "Manuel", "CinetPay"], 
        default: "À la livraison" 
    },
    payment: { type: Boolean, required: true, default: false },
    status: { 
        type: String, 
        required: true, 
        enum: ["Commande passée", "En cours de préparation", "Expédié", "Livré", "Annulé"],
        default: "Commande passée" 
    }
}, { timestamps: true, versionKey: false });

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;
