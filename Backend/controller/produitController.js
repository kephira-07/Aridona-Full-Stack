import produitModel from '../models/produitModel.js';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import fs from 'fs';

// Helper pour parser les tableaux (sizes, couleurs) en toute sécurité
const parseArrayHelper = (input) => {
  if (!input) return [];
  try {
    if (Array.isArray(input)) return input;
    const cleanInput = typeof input === 'string' ? input.trim() : input;
    return JSON.parse(cleanInput);
  } catch (e) {
    if (typeof input === 'string') {
      return input.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
};

// Helper pour nettoyer les fichiers temporaires locaux de Multer
const cleanLocalFiles = (files) => {
  if (!files) return;
  Object.values(files).flatMap(f => f).forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) { console.error("Erreur suppression temp file:", e); }
    }
  });
};

// 1. Ajouter un produit
const addproduit = async (req, res) => {
  try {
    const { nom, description, prix, categorie, matiere, couleurs, sizes, meilleurVente } = req.body;

    if (!nom || !description || !prix || !categorie) {
      cleanLocalFiles(req.files);
      return res.status(400).json({ success: false, message: "Les champs nom, description, prix et catégorie sont obligatoires." });
    }

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
          folder: 'arilona_bijoux'
        });
        return result.secure_url;
      })
    );

    // Supprimer les fichiers temporaires après upload Cloudinary
    cleanLocalFiles(req.files);

    const slug = slugify(nom, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    const parsedSizes = parseArrayHelper(sizes);
    const parsedCouleurs = parseArrayHelper(couleurs);

    const produitData = {
      nom,
      description,
      prix: Number(prix),
      categorie,
      matiere: matiere || "Acier Inoxydable",
      couleurs: parsedCouleurs.length > 0 ? parsedCouleurs : ["Doré"],
      sizes: parsedSizes,
      meilleurVente: meilleurVente === "true" || meilleurVente === true,
      image: imagesUrl,
      slug
    };

    const produit = new produitModel(produitData);
    await produit.save();

    return res.status(201).json({ success: true, message: "Produit ajouté avec succès !" });
  } catch (error) {
    cleanLocalFiles(req.files);
    console.error("Erreur ajout produit:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listproduits = async (req, res) => {
  try {
    const { categorieId } = req.query;
    const filtre = categorieId ? { categorie: categorieId } : {};

    // On récupère les produits
    const produits = await produitModel.find(filtre).populate("categorie", "nom name");

    return res.status(200).json({ success: true, produits });
  } catch (error) {
    console.error("Erreur listproduits :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Extraire Public ID Cloudinary
const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    let publicIdWithExtension = parts[1];
    if (publicIdWithExtension.startsWith('v')) {
      const remainingParts = publicIdWithExtension.split('/');
      remainingParts.shift();
      publicIdWithExtension = remainingParts.join('/');
    }
    return publicIdWithExtension.split('.').slice(0, -1).join('.');
  } catch (error) {
    return null;
  }
};

// 3. Supprimer un produit
const removeproduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await produitModel.findById(id);

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    if (produit.image && produit.image.length > 0) {
      for (const imageUrl of produit.image) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await produitModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Bijou et ses images supprimés avec succès !" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Produit unique
const singleproduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await produitModel.findById(id).populate("categorie");

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({ success: true, produit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Modifier un produit
const updateproduit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, categorie, matiere, couleurs, sizes, meilleurVente } = req.body;

    const updateData = {};
    if (nom) {
      updateData.nom = nom;
      updateData.slug = slugify(nom, { lower: true, strict: true });
    }
    if (description) updateData.description = description;
    if (prix) updateData.prix = Number(prix);
    if (categorie) updateData.categorie = categorie;
    if (matiere) updateData.matiere = matiere;
    if (couleurs) updateData.couleurs = parseArrayHelper(couleurs);
    if (meilleurVente !== undefined) updateData.meilleurVente = (meilleurVente === "true" || meilleurVente === true);
    if (sizes) updateData.sizes = parseArrayHelper(sizes);

    if (req.files && Object.keys(req.files).length > 0) {
      const images = [
        req.files.image1?.[0],
        req.files.image2?.[0],
        req.files.image3?.[0],
        req.files.image4?.[0]
      ].filter(Boolean);

      if (images.length > 0) {
        const imagesUrl = await Promise.all(
          images.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, {
              resource_type: 'image',
              folder: 'arilona_bijoux'
            });
            return result.secure_url;
          })
        );
        updateData.image = imagesUrl;
      }
      cleanLocalFiles(req.files);
    }

    const produitModifie = await produitModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate("categorie");

    if (!produitModifie) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({ success: true, message: "Produit modifié avec succès !", produit: produitModifie });
  } catch (error) {
    cleanLocalFiles(req.files);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Rechercher des produits
const searchProduits = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Veuillez entrer un mot clé" });
    }

    const resultats = await produitModel.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .populate("categorie")
    .sort({ score: { $meta: "textScore" } });

    return res.status(200).json({ success: true, produits: resultats });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur lors de la recherche" });
  }
};

// 7. Changer le statut du stock
const changerStatutStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { enStock } = req.body;

    if (enStock === undefined) {
      return res.status(400).json({ success: false, message: "Le statut enStock est obligatoire." });
    }

    const produit = await produitModel.findByIdAndUpdate(
      id, 
      { enStock: Boolean(enStock) },
      { new: true }
    );

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({ 
      success: true, 
      message: enStock ? "Produit marqué en stock" : "Produit marqué en rupture",
      produit
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { addproduit, listproduits, removeproduit, singleproduit, updateproduit, searchProduits, changerStatutStock };