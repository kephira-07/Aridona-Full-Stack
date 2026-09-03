import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  extrait: { type: String, required: true, trim: true, maxlength: 300 }, // résumé (carte blog + repli meta description)
  contenu: { type: String, required: true }, // texte brut, paragraphes séparés par une ligne vide

  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'produit', index: true },

  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String, trim: true, default: '' },
  },

  auteur: { type: String, default: "Aridona Bijoux" },
  tags: { type: [String], default: [], index: true },

  // Brouillon tant que non publié explicitement par l'admin
  publie: { type: Boolean, default: false },

  metaTitle: { type: String, trim: true, maxlength: 70 },
  metaDescription: { type: String, trim: true, maxlength: 160 },
}, { timestamps: true });

articleSchema.index(
  { titre: "text", extrait: "text", contenu: "text", tags: "text" },
  { weights: { titre: 10, tags: 8, extrait: 5, contenu: 1 }, default_language: 'french' }
);

const articleModel = mongoose.models.article || mongoose.model("article", articleSchema);
export default articleModel;
