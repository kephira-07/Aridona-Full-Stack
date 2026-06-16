import mongoose from 'mongoose';

const utilisateurSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // 🌟 NOUVEAUX CHAMPS PREMIUM
    telephone: { type: String, default: "" },
    adresse: { type: String, default: "" },
    ville: { type: String, default: "Lomé" }
}, { minimize: false });

const utilisateurModel = mongoose.models.utilisateur || mongoose.model("utilisateur", utilisateurSchema);
export default utilisateurModel;