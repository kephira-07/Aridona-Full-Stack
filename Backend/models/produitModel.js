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
  
  // Matière principale (ex: "Acier Inoxydable 316L", "Or 18k", "Argent 925")
  matiere: { type: String, default: "Acier Inoxydable" }, 
  
  // Couleurs disponibles sélectionnables par le client
  couleurs: { 
    type: [String], 
    enum: ["Doré", "Argenté", "Or Rose"],
    default: ["Doré"] 
  },
  
  sizes: { type: [String], default: [] },
  slug: { type: String, required: true, unique: true, index: true },
  meilleurVente: { type: Boolean, default: false },
  enStock: { type: Boolean, default: true }
}, { timestamps: true });

// Indexation pour la recherche plein texte (inclut la couleur)
produitSchema.index(
  { nom: "text", description: "text", matiere: "text", couleurs: "text" },
  { weights: { nom: 10, matiere: 5, couleurs: 5, description: 1 } }
);

const produitModel = mongoose.models.produit || mongoose.model("produit", produitSchema);

export default produitModel;