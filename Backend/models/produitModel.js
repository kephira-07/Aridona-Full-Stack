import mongoose from "mongoose";

const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true, min: 0 },

  // Chaque image = URL (affichage) + publicId (suppression Cloudinary) + alt (SEO/accessibilité)
  image: {
    type: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      alt: { type: String, trim: true, default: '' },
    }],
    validate: [(arr) => arr.length > 0, "Au moins une image est requise."], // bloque le tableau vide
  },

  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'categorie', required: true },
  matiere: { type: String, default: "Acier Inoxydable" },
  couleurs: { type: [String], enum: ["Doré", "Argenté", "Or Rose"], default: ["Doré"] },
  tags: { type: [String], default: [], index: true }, // index utile pour { tags: "choker" }
  sizes: { type: [String], default: [] },
  slug: { type: String, required: true, unique: true }, // unique crée déjà l'index, pas besoin de index: true
  meilleurVente: { type: Boolean, default: false },
  enStock: { type: Boolean, default: true },
  stock: { type: Number, min: 0, default: null },

  // Surcharges SEO optionnelles : si vides, le frontend retombe sur nom/description tronqués.
  metaTitle: { type: String, trim: true, maxlength: 70 },
  metaDescription: { type: String, trim: true, maxlength: 160 },
}, { timestamps: true });

produitSchema.index(
  { nom: "text", tags: "text", matiere: "text", couleurs: "text", description: "text" },
  {
    weights: { nom: 10, tags: 8, matiere: 5, couleurs: 5, description: 1 },
    default_language: 'french',
  }
);

const produitModel = mongoose.models.produit || mongoose.model("produit", produitSchema);
export default produitModel;