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

const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    const after = url.split('/upload/')[1];
    if (!after) return null;
    const parts = after.split('/');
    if (/^v\d+$/.test(parts[0])) parts.shift();      // retire le segment de version vNNN
    return parts.join('/').replace(/\.[^.]+$/, '');  // retire l'extension
  } catch {
    return null;
  }
};

const parseTagsHelper = (input) => {
  const rawArray = parseArrayHelper(input);
  return rawArray.map(tag => tag.trim().toLowerCase()).filter(Boolean);
};

// Génère un slug unique en ajoutant -2, -3... si le slug de base est déjà pris
// (par un autre produit, ou par ce produit-là si excludeId n'est pas fourni).
const generateUniqueSlug = async (nom, excludeId = null) => {
  const baseSlug = slugify(nom, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let counter = 2;
  while (await produitModel.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// 1. Ajouter un produit
const addproduit = async (req, res) => {
  try {
    const { nom, description, prix, categorie, matiere, couleurs, sizes, tags, meilleurVente, alts, metaTitle, metaDescription } = req.body;

    if (!nom || !description || !prix || !categorie) {
      cleanLocalFiles(req.files);
      return res.status(400).json({ success: false, message: "Les champs nom, description, prix et catégorie sont obligatoires." });
    }

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(Boolean);
    const parsedAlts = parseArrayHelper(alts);

    const uploaded = await Promise.all(
      images.map((item) =>
        cloudinary.uploader.upload(item.path, { resource_type: 'image', folder: 'aridona/bijoux' })
      )
    );
    const imageDocs = uploaded.map((r, i) => ({
      url: r.secure_url,
      publicId: r.public_id,
      alt: (parsedAlts[i] && String(parsedAlts[i]).trim()) || `${nom} - vue ${i + 1}`,
    }));

    // Supprimer les fichiers temporaires après upload Cloudinary
    cleanLocalFiles(req.files);

    const slug = await generateUniqueSlug(nom);
    const parsedSizes = parseArrayHelper(sizes);
    const parsedCouleurs = parseArrayHelper(couleurs);
    const parsedTags = parseTagsHelper(tags); // Traitement des tags

    const produitData = {
      nom,
      description,
      prix: Number(prix),
      categorie,
      matiere: matiere || "Acier Inoxydable",
      couleurs: parsedCouleurs.length > 0 ? parsedCouleurs : ["Doré"],
      sizes: parsedSizes,
      tags: parsedTags, // Ajout des tags
      meilleurVente: meilleurVente === "true" || meilleurVente === true,
      image: imageDocs,
      slug,
      metaTitle,
      metaDescription,
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

// 2. Supprimer un produit
const removeproduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await produitModel.findById(id);

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    if (produit.image && produit.image.length > 0) {
      for (const img of produit.image) {
        const publicId = img?.publicId || getPublicIdFromUrl(img?.url || img);
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

// 3. Produit unique
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

// 4. Modifier un produit
const updateproduit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, categorie, matiere, couleurs, sizes, tags, meilleurVente, imagesManifest, metaTitle, metaDescription } = req.body;

    const updateData = {};
    if (nom) {
      updateData.nom = nom;
      updateData.slug = await generateUniqueSlug(nom, id);
    }
    if (description) updateData.description = description;
    if (prix) updateData.prix = Number(prix);
    if (categorie) updateData.categorie = categorie;
    if (matiere) updateData.matiere = matiere;
    if (couleurs) updateData.couleurs = parseArrayHelper(couleurs);
    if (sizes) updateData.sizes = parseArrayHelper(sizes);
    if (tags !== undefined) updateData.tags = parseTagsHelper(tags); // Prise en compte de la mise à jour des tags
    if (meilleurVente !== undefined) updateData.meilleurVente = (meilleurVente === "true" || meilleurVente === true);
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    // Le manifeste décrit l'état voulu de chacun des 4 emplacements (image1..image4) :
    // { type: 'existing', url, publicId, alt } pour une image conservée (alt éditable),
    // { type: 'new', alt } pour un emplacement dont le fichier est envoyé à part (imageN),
    // { type: 'empty' } (ou absent) pour un emplacement vidé.
    // Sans ce champ, les images ne sont pas touchées (compatibilité des autres appels).
    let ancienProduit = null;
    let removedPublicIds = [];
    if (imagesManifest !== undefined) {
      const manifest = parseArrayHelper(imagesManifest);
      ancienProduit = await produitModel.findById(id);
      if (!ancienProduit) {
        cleanLocalFiles(req.files);
        return res.status(404).json({ success: false, message: "Produit introuvable" });
      }
      const nomPourAlt = nom || ancienProduit.nom || '';

      const finalImages = [];
      const keptPublicIds = new Set();

      for (let i = 0; i < manifest.length; i++) {
        const slot = manifest[i];
        if (!slot || slot.type === 'empty') continue;

        if (slot.type === 'existing' && slot.publicId) {
          finalImages.push({
            url: slot.url,
            publicId: slot.publicId,
            alt: (slot.alt && String(slot.alt).trim()) || `${nomPourAlt} - vue ${i + 1}`,
          });
          keptPublicIds.add(slot.publicId);
        } else if (slot.type === 'new') {
          const file = req.files?.[`image${i + 1}`]?.[0];
          if (file) {
            const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image', folder: 'aridona/bijoux' });
            finalImages.push({
              url: result.secure_url,
              publicId: result.public_id,
              alt: (slot.alt && String(slot.alt).trim()) || `${nomPourAlt} - vue ${i + 1}`,
            });
          }
        }
      }

      cleanLocalFiles(req.files);

      if (finalImages.length === 0) {
        return res.status(400).json({ success: false, message: "Au moins une image est requise." });
      }

      updateData.image = finalImages;
      removedPublicIds = (ancienProduit.image || [])
        .map((img) => img?.publicId || getPublicIdFromUrl(img?.url || img))
        .filter((publicId) => publicId && !keptPublicIds.has(publicId));
    } else {
      cleanLocalFiles(req.files);
    }

    const produitModifie = await produitModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("categorie");

    if (!produitModifie) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    // On ne supprime les anciennes images de Cloudinary qu'après confirmation
    // que le nouveau document est bien enregistré, pour ne rien perdre en cas d'échec.
    for (const publicId of removedPublicIds) {
      await cloudinary.uploader.destroy(publicId);
    }

    return res.status(200).json({ success: true, message: "Produit modifié avec succès !", produit: produitModifie });
  } catch (error) {
    cleanLocalFiles(req.files);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Rechercher des produits
const searchProduits = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Veuillez entrer un mot clé" });
    }

    // Grâce à l'index text mis à jour sur le schéma, cette recherche inclura automatiquement les tags !
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
      { new: true, runValidators: true }
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