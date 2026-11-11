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
    default: "" 
  },
  googleId: { 
    type: String, 
    default: "",
    index: true 
  },
  avatar: { 
    type: String, 
    default: "" 
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
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
  cartData: {
    type: Object,
    default: {}
  },
  cartPacks: {
    type: Object,
    default: {}
  }
}, { 
  minimize: false,
  timestamps: true 
});

const utilisateurModel = mongoose.models.utilisateur || mongoose.model("utilisateur", utilisateurSchema);

export default utilisateurModel;
