import mongoose from 'mongoose';
import avisModel from '../models/avisModel.js';
import produitModel from '../models/produitModel.js';

// 1. Soumettre un avis (public) — publié immédiatement, sans validation admin préalable.
// L'admin garde la main a posteriori : /api/avis/admin liste tout, /supprimer/:id retire
// un avis inapproprié après coup (voir admin/src/pages/Avis.jsx).
const ajouterAvis = async (req, res) => {
  try {
    const { produitId, nom, note, commentaire } = req.body;

    if (!produitId || !nom || !note || !commentaire) {
      return res.status(400).json({ success: false, message: "Les champs nom, note et commentaire sont obligatoires." });
    }

    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(400).json({ success: false, message: "Identifiant produit invalide." });
    }

    const noteNum = Number(note);
    if (!Number.isInteger(noteNum) || noteNum < 1 || noteNum > 5) {
      return res.status(400).json({ success: false, message: "La note doit être un entier compris entre 1 et 5." });
    }

    const produit = await produitModel.exists({ _id: produitId });
    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }

    const avis = await avisModel.create({
      produit: produitId,
      nom: nom.trim(),
      note: noteNum,
      commentaire: commentaire.trim(),
      approuve: true,
    });

    return res.status(201).json({
      success: true,
      message: "Merci pour votre avis !",
      avis,
    });
  } catch (error) {
    console.error("Erreur ajout avis :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 2. Lister les avis approuvés d'un produit (public) + statistiques agrégées
const listAvisProduit = async (req, res) => {
  try {
    const { produitId } = req.params;

    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(400).json({ success: false, message: "Identifiant produit invalide." });
    }

    const avis = await avisModel.find({ produit: produitId, approuve: true }).sort({ createdAt: -1 });

    const total = avis.length;
    const moyenne = total > 0
      ? Number((avis.reduce((acc, a) => acc + a.note, 0) / total).toFixed(1))
      : 0;

    return res.status(200).json({ success: true, avis, moyenne, total });
  } catch (error) {
    console.error("Erreur liste avis produit :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 3. Lister tous les avis, y compris en attente (admin — modération)
const listAvisAdmin = async (req, res) => {
  try {
    const avis = await avisModel.find({})
      .populate("produit", "nom")
      .sort({ approuve: 1, createdAt: -1 });

    return res.status(200).json({ success: true, avis });
  } catch (error) {
    console.error("Erreur liste avis admin :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 4. Approuver un avis en attente (admin)
const approuverAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const avis = await avisModel.findByIdAndUpdate(id, { approuve: true }, { new: true });

    if (!avis) {
      return res.status(404).json({ success: false, message: "Avis introuvable." });
    }

    return res.status(200).json({ success: true, message: "Avis approuvé et publié.", avis });
  } catch (error) {
    console.error("Erreur approbation avis :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 5. Supprimer un avis (admin)
const supprimerAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const avis = await avisModel.findByIdAndDelete(id);

    if (!avis) {
      return res.status(404).json({ success: false, message: "Avis introuvable." });
    }

    return res.status(200).json({ success: true, message: "Avis supprimé." });
  } catch (error) {
    console.error("Erreur suppression avis :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

export { ajouterAvis, listAvisProduit, listAvisAdmin, approuverAvis, supprimerAvis };
