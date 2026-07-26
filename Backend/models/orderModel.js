import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'produit', required: true },
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    size: { type: String, required: true, default: "Standard" },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: [String], required: true }
}, { _id: false });

const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    phone: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    
    userId: { type: mongoose.Schema.Types.Mixed, required: true, default: "guest_order" },
    items: { type: [itemSchema], required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, default: "Manuel" },
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