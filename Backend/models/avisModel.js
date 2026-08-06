import mongoose from "mongoose";

const avisSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'produit', required: true, index: true },
  nom: { type: String, required: true, trim: true },
  note: { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, required: true, trim: true },
  verifie: { type: Boolean, default: false }, // achat vérifié (réservé à un futur rapprochement avec les commandes)
  // Publié immédiatement à la création (voir avisController.ajouterAvis) ; conservé comme
  // simple drapeau de visibilité que l'admin peut repasser à false plus tard si besoin.
  approuve: { type: Boolean, default: true },
}, { timestamps: true });

const avisModel = mongoose.models.avis || mongoose.model("avis", avisSchema);
export default avisModel;
