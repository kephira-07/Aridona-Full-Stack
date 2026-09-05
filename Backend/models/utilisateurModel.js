import mongoose from 'mongoose';

const utilisateurSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Le nom est obligatoire"], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "L'email est obligatoire"], 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  password: { 
    type: String, 
    // ⚠️ OBLIGATOIRE : Rendre facultatif pour les connexions Google
    required: function() {
      return !this.googleId; // Le mot de passe est requis SEULEMENT si ce n'est pas un compte Google
    }
  },
  
  // ➕ AJOUT : Identifiant unique Google OAuth
  googleId: { 
    type: String, 
    default: "",
    index: true 
  },
  // ➕ AJOUT : Photo de profil Google (optionnel mais recommandé pour l'interface)
  avatar: { 
    type: String, 
    default: "" 
  },

  cartData: {
    type: Object,
    default: {}
  },
  // Panier des packs : { [packId]: quantite } — séparé de cartData car un pack n'a pas de taille.
  cartPacks: {
    type: Object,
    default: {}
  },
  telephone: { 
    type: String, 
    default: "" 
  },
  adresse: { 
    type: String, 
    default: "" 
  },
  ville: { 
    type: String, 
    default: "Lomé" 
  },
  
  // Champs de sécurité pour la réinitialisation du mot de passe
  resetPasswordToken: { 
    type: String, 
    default: "",
    index: true 
  },
  resetPasswordExpires: { 
    type: Date, 
    default: null 
  }
}, { 
  minimize: false,
  timestamps: true 
});

const utilisateurModel = mongoose.models.utilisateur || mongoose.model("utilisateur", utilisateurSchema);

export default utilisateurModel;