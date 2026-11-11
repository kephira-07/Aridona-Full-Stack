import articleModel from '../models/articleModel.js';
import produitModel from '../models/produitModel.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import generateUniqueSlug from '../utils/slug.js';
import { cleanLocalFile } from '../utils/cleanLocalFile.js';

const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    const after = url.split('/upload/')[1];
    if (!after) return null;
    const parts = after.split('/');
    if (/^v\d+$/.test(parts[0])) parts.shift();
    return parts.join('/').replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
};

const parseTags = (input) => {
  if (!input) return [];
  try {
    const arr = typeof input === 'string' ? JSON.parse(input) : input;
    return Array.isArray(arr) ? arr.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [];
  } catch {
    return String(input).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
};

// 1. Ajouter un article (admin)
const ajouterArticle = async (req, res) => {
  try {
    const { titre, extrait, contenu, tags, publie, metaTitle, metaDescription, produitId } = req.body;
    const imageFile = req.file;

    if (!titre || !extrait || !contenu || typeof titre !== 'string' || typeof extrait !== 'string' || typeof contenu !== 'string') {
      cleanLocalFile(imageFile);
      return res.status(400).json({ success: false, message: "Titre, extrait et contenu sont obligatoires." });
    }
    if (!produitId || typeof produitId !== 'string' || !mongoose.isValidObjectId(produitId)) {
      return res.status(400).json({ success: false, message: "Veuillez sélectionner un produit existant." });
    }

    const produit = await produitModel.findOne({ _id: { $eq: produitId } }).select('image');
    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }
    const imagePrincipale = produit.image?.[0];
    if (!imagePrincipale?.url) {
      return res.status(400).json({ success: false, message: "Le produit sélectionné ne possède pas d'image." });
    }

    cleanLocalFile(imageFile);

    const slug = await generateUniqueSlug(articleModel, titre);

    const article = new articleModel({
      titre: titre.trim(),
      slug,
      extrait: extrait.trim(),
      contenu: contenu.trim(),
      produit: produit._id,
      tags: parseTags(tags),
      publie: publie === 'true' || publie === true,
      metaTitle: typeof metaTitle === 'string' ? metaTitle.trim() : undefined,
      metaDescription: typeof metaDescription === 'string' ? metaDescription.trim() : undefined,
    });

    await article.save();
    return res.status(201).json({ success: true, message: "Article créé avec succès !", article });
  } catch (error) {
    cleanLocalFile(req.file);
    console.error("Erreur ajout article:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 2. Lister les articles publiés (public)
const listerArticles = async (req, res) => {
  try {
    const articles = await articleModel.find({ publie: true }).populate('produit', 'nom slug image').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 3. Lister tous les articles, brouillons compris (admin)
const listerArticlesAdmin = async (req, res) => {
  try {
    const articles = await articleModel.find({}).populate('produit', 'nom slug image').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 4. Récupérer un article publié par son slug (public)
const getArticleParSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({ success: false, message: "Slug invalide." });
    }
    const article = await articleModel.findOne({ slug: { $eq: slug }, publie: true }).populate('produit', 'nom slug image');
    if (!article) {
      return res.status(404).json({ success: false, message: "Article introuvable." });
    }
    return res.status(200).json({ success: true, article });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 5. Modifier un article (admin)
const modifierArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, extrait, contenu, tags, publie, metaTitle, metaDescription, produitId } = req.body;
    const imageFile = req.file;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      cleanLocalFile(imageFile);
      return res.status(400).json({ success: false, message: "Identifiant d'article invalide." });
    }

    const article = await articleModel.findById(id);
    if (!article) {
      cleanLocalFile(imageFile);
      return res.status(404).json({ success: false, message: "Article introuvable." });
    }

    const updateData = {};
    if (produitId !== undefined) {
      if (typeof produitId !== 'string' || !mongoose.isValidObjectId(produitId)) {
        return res.status(400).json({ success: false, message: "Produit sélectionné invalide." });
      }
      const produit = await produitModel.findOne({ _id: { $eq: produitId } }).select('image');
      if (!produit) {
        return res.status(404).json({ success: false, message: "Produit introuvable." });
      }
      if (!produit.image?.[0]?.url) {
        return res.status(400).json({ success: false, message: "Le produit sélectionné ne possède pas d'image." });
      }
      updateData.produit = produit._id;
    }
    if (typeof titre === 'string' && titre.trim() && titre.trim() !== article.titre) {
      updateData.titre = titre.trim();
      updateData.slug = await generateUniqueSlug(articleModel, titre, id);
    }
    if (typeof extrait === 'string' && extrait.trim()) updateData.extrait = extrait.trim();
    if (typeof contenu === 'string' && contenu.trim()) updateData.contenu = contenu.trim();
    if (tags !== undefined) updateData.tags = parseTags(tags);
    if (publie !== undefined) updateData.publie = (publie === 'true' || publie === true);
    if (typeof metaTitle === 'string') updateData.metaTitle = metaTitle.trim();
    if (typeof metaDescription === 'string') updateData.metaDescription = metaDescription.trim();

    cleanLocalFile(imageFile);

    const articleModifie = await articleModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('produit', 'nom slug image');

    return res.status(200).json({ success: true, message: "Article mis à jour avec succès !", article: articleModifie });
  } catch (error) {
    cleanLocalFile(req.file);
    console.error("Erreur modification article:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 6. Supprimer un article (admin)
const supprimerArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Identifiant d'article invalide." });
    }
    const article = await articleModel.findById(id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article introuvable." });
    }

    const publicId = article.image?.publicId || getPublicIdFromUrl(article.image?.url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await articleModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Article supprimé avec succès !" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

export { ajouterArticle, listerArticles, listerArticlesAdmin, getArticleParSlug, modifierArticle, supprimerArticle };
