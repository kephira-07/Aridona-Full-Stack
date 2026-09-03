import mongoose from 'mongoose';

const packItemSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'produit', required: true },
  quantite: { type: Number, required: true, min: 1, max: 20, default: 1 },
}, { _id: false });

const packSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  produits: {
    type: [packItemSchema],
    required: true,
    validate: [(items) => items.length >= 2, 'Un pack doit contenir au moins deux produits.'],
  },
  prix: { type: Number, required: true, min: 0 },
  actif: { type: Boolean, default: true },
  slug: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

const packModel = mongoose.models.pack || mongoose.model('pack', packSchema);
export default packModel;
