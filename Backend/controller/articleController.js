import articleModel from '../models/articleModel.js';
import produitModel from '../models/produitModel.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import fs from 'fs';

const cleanLocalFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    try { fs.unlinkSync(file.path); } catch (e) { console.error("Erreur nettoyage fichier temporaire:", e); }
  }
};

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

// Génère un slug unique en ajoutant -2, -3... si le slug de base est déjà pris
const generateUniqueSlug = async (titre, excludeId = null) => {
  const baseSlug = slugify(titre, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let counter = 2;
  while (await articleModel.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
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

    if (!titre || !extrait || !contenu) {
      cleanLocalFile(imageFile);
      return res.status(400).json({ success: false, message: "Titre, extrait et contenu sont obligatoires." });
    }
    if (!produitId || !mongoose.isValidObjectId(produitId)) {
      return res.status(400).json({ success: false, message: "Veuillez sélectionner un produit existant." });
    }

    const produit = await produitModel.findById(produitId).select('image');
    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable." });
    }
    const imagePrincipale = produit.image?.[0];
    if (!imagePrincipale?.url) {
      return res.status(400).json({ success: false, message: "Le produit sélectionné ne possède pas d'image." });
    }

    cleanLocalFile(imageFile);

    const slug = await generateUniqueSlug(titre);

    const article = new articleModel({
      titre: titre.trim(),
      slug,
      extrait: extrait.trim(),
      contenu: contenu.trim(),
      produit: produitId,
      tags: parseTags(tags),
      publie: publie === 'true' || publie === true,
      metaTitle,
      metaDescription,
    });

    await article.save();
    return res.status(201).json({ success: true, message: "Article créé avec succès !", article });
  } catch (error) {
    cleanLocalFile(req.file);
    console.error("Erreur ajout article:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lister les articles publiés (public)
const listerArticles = async (req, res) => {
  try {
    const articles = await articleModel.find({ publie: true }).populate('produit', 'nom slug image').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Lister tous les articles, brouillons compris (admin)
const listerArticlesAdmin = async (req, res) => {
  try {
    const articles = await articleModel.find({}).populate('produit', 'nom slug image').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Récupérer un article publié par son slug (public)
const getArticleParSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await articleModel.findOne({ slug, publie: true }).populate('produit', 'nom slug image');
    if (!article) {
      return res.status(404).json({ success: false, message: "Article introuvable." });
    }
    return res.status(200).json({ success: true, article });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Modifier un article (admin)
const modifierArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, extrait, contenu, tags, publie, metaTitle, metaDescription, produitId } = req.body;
    const imageFile = req.file;

    const article = await articleModel.findById(id);
    if (!article) {
      cleanLocalFile(imageFile);
      return res.status(404).json({ success: false, message: "Article introuvable." });
    }

    const updateData = {};
    if (produitId !== undefined) {
      if (!mongoose.isValidObjectId(produitId)) {
        return res.status(400).json({ success: false, message: "Produit sélectionné invalide." });
      }
      const produit = await produitModel.findById(produitId).select('image');
      if (!produit) {
        return res.status(404).json({ success: false, message: "Produit introuvable." });
      }
      if (!produit.image?.[0]?.url) {
        return res.status(400).json({ success: false, message: "Le produit sélectionné ne possède pas d'image." });
      }
      updateData.produit = produitId;
    }
    if (titre && titre.trim() !== article.titre) {
      updateData.titre = titre.trim();
      updateData.slug = await generateUniqueSlug(titre, id);
    }
    if (extrait) updateData.extrait = extrait.trim();
    if (contenu) updateData.contenu = contenu.trim();
    if (tags !== undefined) updateData.tags = parseTags(tags);
    if (publie !== undefined) updateData.publie = (publie === 'true' || publie === true);
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    cleanLocalFile(imageFile);

    const articleModifie = await articleModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('produit', 'nom slug image');

    return res.status(200).json({ success: true, message: "Article mis à jour avec succès !", article: articleModifie });
  } catch (error) {
    cleanLocalFile(req.file);
    console.error("Erreur modification article:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Supprimer un article (admin)
const supprimerArticle = async (req, res) => {
  try {
    const { id } = req.params;
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { ajouterArticle, listerArticles, listerArticlesAdmin, getArticleParSlug, modifierArticle, supprimerArticle };
