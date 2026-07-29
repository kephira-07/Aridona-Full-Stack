import mongoose from "mongoose";

const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true, min: 0 },
  image: { type: [String], required: true },
  
  categorie: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'categorie', 
    required: true 
  },
  
  // Matière principale
  matiere: { type: String, default: "Acier Inoxydable" }, 
  
  // Couleurs disponibles
  couleurs: { 
    type: [String], 
    enum: ["Doré", "Argenté", "Or Rose"],
    default: ["Doré"] 
  },
  

  tags: { 
    type: [String], 
    default: [],
    index: true // Index standard pour les requêtes rapides par tag ex: { tags: "choker" }
  },

  sizes: { type: [String], default: [] },
  slug: { type: String, required: true, unique: true, index: true },
  meilleurVente: { type: Boolean, default: false },
  enStock: { type: Boolean, default: true }
}, { timestamps: true });

// INDEXATION POUR LA RECHERCHE PLEIN TEXTE (Mise à jour avec "tags")
produitSchema.index(
  { nom: "text", tags: "text", matiere: "text", couleurs: "text", description: "text" },
  { weights: { nom: 10, tags: 8, matiere: 5, couleurs: 5, description: 1 } }
);

const produitModel = mongoose.models.produit || mongoose.model("produit", produitSchema);

export default produitModel;