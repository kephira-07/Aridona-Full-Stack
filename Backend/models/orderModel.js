import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [
        {
            _id: { type: String, required: true },
            nom: { type: String, required: true },
            prix: { type: Number, required: true },
            size: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: Array, required: true }
        }
    ],
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true, default: "Cash" },
    payment: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, default: "Commande passée" },
    date: { type: Number, required: true, default: Date.now },
    address: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipcode: { type: String, required: true },
        phone: { type: String, required: true }
    }
}, { shrinkKey: true, versionKey: false });

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;