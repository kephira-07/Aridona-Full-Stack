import mongoose from 'mongoose';

const utilisateurSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    telephone: { type: String, default: "" },
    adresse: { type: String, default: "" },
    ville: { type: String, default: "Lomé" },
    
    // Sécurité pour le mot de passe oublié
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null }
}, { minimize: false ,
    timestamps: true
});

const utilisateurModel = mongoose.models.utilisateur || mongoose.model("utilisateur", utilisateurSchema);
export default utilisateurModel;
