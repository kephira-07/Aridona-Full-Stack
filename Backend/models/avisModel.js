import mongoose from "mongoose";

const avisSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'produit', required: true, index: true },
  nom: { type: String, required: true, trim: true },
  note: { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, required: true, trim: true },
  verifie: { type: Boolean, default: false }, // achat vérifié (réservé à un futur rapprochement avec les commandes)
  approuve: { type: Boolean, default: false }, // modération admin avant publication publique
}, { timestamps: true });

const avisModel = mongoose.models.avis || mongoose.model("avis", avisSchema);
export default avisModel;
