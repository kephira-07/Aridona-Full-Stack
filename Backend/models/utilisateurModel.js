import mongoose from 'mongoose';

const utilisateurSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    telephone: { type: String, default: "" },
    adresse: { type: String, default: "" },
    ville: { type: String, default: "Lomé" },
    
    // 🌟 AJOUT DE SÉCURITÉ POUR LE MOT DE PASSE OUBLIÉ
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null }
}, { minimize: false });

const utilisateurModel = mongoose.models.utilisateur || mongoose.model("utilisateur", utilisateurSchema);
export default utilisateurModel;