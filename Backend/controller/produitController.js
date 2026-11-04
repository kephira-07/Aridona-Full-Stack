import produitModel from '../models/produitModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import generateUniqueSlug from '../utils/slug.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Contrôleur pour l'analyse IA
const analyzeProductImage = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Aucune image fournie." });
    }

    const prompt = `
      Tu es un expert en e-commerce de bijoux en acier inoxydable pour Aridona Bijoux.
      Analyse l\'image de ce bijou et génère une fiche produit au format JSON strict (sans aucun texte autour, sans balises markdown \`\`\`json).
      Le JSON doit contenir exactement ces clés :
      - "nom": Un titre élégant et vendeur en français.
      - "description": Une description poétique et raffinée mettant en valeur la résistance et l\'acier inoxydable.
      - "tags": Une liste de 4 à 6 mots-clés séparés par des virgules (ex: collier, acier inoxydable, doré, minimaliste).
      - "metaTitle": Un titre SEO accrocheur de moins de 70 caractères.
      - "metaDescription": Une description SEO engageante de moins de 160 caractères.
      - "couleurs": Un tableau parmi ces choix exacts selon la couleur dominante: ["Doré", "Argenté", "Rosé"].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64,
          },
        },
      ],
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const productData = JSON.parse(rawText);

    return res.json({ success: true, product: productData });

  } catch (error) {
    console.error("Erreur analyse Gemini :", error);
    return res.status(500).json({ success: false, message: "Erreur lors de l\'analyse de l\'image par l\'IA." });
  }
};



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

// "Or Rose" a été renommé en "Rosé" dans l'enum du modèle — remappe toute valeur héritée
// envoyée par un client non à jour (ex. bundle admin en cache) pour ne jamais faire
// planter la validation Mongoose sur une couleur qui n'existe plus.
const LEGACY_COULEURS = { 'Or Rose': 'Rosé' };
const parseCouleursHelper = (input) => parseArrayHelper(input).map((c) => LEGACY_COULEURS[c] || c);

// 1. Ajouter un produit
const addproduit = async (req, res) => {
  try {
    const { nom, description, prix, categorie, matiere, couleurs, sizes, tags, meilleurVente, stock, alts, metaTitle, metaDescription } = req.body;

    if (!nom || !description || !prix || !categorie) {
      cleanLocalFiles(req.files);
      return res.status(400).json({ success: false, message: "Les champs nom, description, prix et catégorie sont obligatoires." });
    }

    const prixValue = Number(prix);
    if (!Number.isSafeInteger(prixValue) || prixValue < 0) {
      cleanLocalFiles(req.files);
      return res.status(400).json({ success: false, message: "Le prix doit être un entier XOF valide." });
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

    const slug = await generateUniqueSlug(produitModel, nom);
    const parsedSizes = parseArrayHelper(sizes);
    const parsedCouleurs = parseCouleursHelper(couleurs);
    const parsedTags = parseTagsHelper(tags); // Traitement des tags

    const stockValue = stock === '' || stock === undefined ? null : Number(stock);
    if (stockValue !== null && (!Number.isInteger(stockValue) || stockValue < 0)) {
      return res.status(400).json({ success: false, message: "Le stock doit être un entier positif ou nul." });
    }

    const produitData = {
      nom,
      description,
      prix: prixValue,
      categorie,
      matiere: matiere || "Acier Inoxydable",
      couleurs: parsedCouleurs.length > 0 ? parsedCouleurs : ["Doré"],
      sizes: parsedSizes,
      tags: parsedTags, // Ajout des tags
      meilleurVente: meilleurVente === "true" || meilleurVente === true,
      stock: stockValue,
      enStock: stockValue === null ? true : stockValue > 0,
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

const singleproduitBySlug = async (req, res) => {
  try {
    const produit = await produitModel.findOne({ slug: req.params.slug }).populate("categorie");

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({ success: true, produit });
  } catch (error) {
    console.error("Erreur singleproduitBySlug :", error);
    return res.status(500).json({ success: false, message: "Erreur lors du chargement du produit." });
  }
};

// 4. Modifier un produit
const updateproduit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, categorie, matiere, couleurs, sizes, tags, meilleurVente, stock, imagesManifest, metaTitle, metaDescription } = req.body;

    const updateData = {};
    if (nom) {
      updateData.nom = nom;
      updateData.slug = await generateUniqueSlug(produitModel, nom, id);
    }
    if (description) updateData.description = description;
    if (prix !== undefined) {
      const prixValue = Number(prix);
      if (!Number.isSafeInteger(prixValue) || prixValue < 0) {
        cleanLocalFiles(req.files);
        return res.status(400).json({ success: false, message: "Le prix doit être un entier XOF valide." });
      }
      updateData.prix = prixValue;
    }
    if (categorie) updateData.categorie = categorie;
    if (matiere) updateData.matiere = matiere;
    if (couleurs) updateData.couleurs = parseCouleursHelper(couleurs);
    if (sizes) updateData.sizes = parseArrayHelper(sizes);
    if (tags !== undefined) updateData.tags = parseTagsHelper(tags); // Prise en compte de la mise à jour des tags
    if (meilleurVente !== undefined) updateData.meilleurVente = (meilleurVente === "true" || meilleurVente === true);
    if (stock !== undefined) {
      const stockValue = stock === '' ? null : Number(stock);
      if (stockValue !== null && (!Number.isInteger(stockValue) || stockValue < 0)) {
        return res.status(400).json({ success: false, message: "Le stock doit être un entier positif ou nul." });
      }
      updateData.stock = stockValue;
      // N'aligne enStock sur le stock QUE si le nombre a réellement changé : le formulaire
      // d'édition renvoie toujours le champ stock (même non modifié), donc sans ce garde-fou
      // on écraserait silencieusement, à chaque simple retouche du produit, un basculement
      // manuel fait depuis /changer-stock (liste des produits).
      if (stockValue !== null) {
        const stockActuel = await produitModel.findById(id).select('stock');
        if (!stockActuel || stockActuel.stock !== stockValue) {
          updateData.enStock = stockValue > 0;
        }
      }
    }
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
      { enStock: enStock === true || enStock === 'true' },
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

// 8. Flux produits pour Google Merchant Center (RSS 2.0 + espace de noms Google Shopping)
// Généré en direct depuis la base à chaque requête (contrairement au sitemap, construit au
// build) : Merchant Center exige un prix/stock à jour, pas un instantané figé au dernier déploiement.
const SITE_URL = 'https://aridona.store';

const escapeXml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const getProductFeed = async (req, res) => {
  try {
    const produits = await produitModel.find({}).populate('categorie', 'nom');

    const items = produits.map((p) => {
      const images = Array.isArray(p.image) ? p.image : [];
      const [imagePrincipale, ...imagesSupplementaires] = images;
      const lien = `${SITE_URL}/produit/${p.slug || p._id}`;

      const additionalImages = imagesSupplementaires
        .slice(0, 10) // limite Google
        .map((img) => `      <g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`)
        .join('\n');

      return `    <item>
      <g:id>${p._id}</g:id>
      <title>${escapeXml(p.nom)}</title>
      <description>${escapeXml(p.description)}</description>
      <link>${escapeXml(lien)}</link>
      <g:image_link>${escapeXml(imagePrincipale?.url)}</g:image_link>
${additionalImages}
      <g:availability>${p.enStock !== false ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${Number(p.prix) || 0} XOF</g:price>
      <g:brand>Aridona Bijoux</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Apparel & Accessories &gt; Jewelry</g:google_product_category>
      ${p.categorie?.nom ? `<g:product_type>${escapeXml(p.categorie.nom)}</g:product_type>` : ''}
    </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Aridona Bijoux — Catalogue</title>
    <link>${SITE_URL}</link>
    <description>Flux produits Aridona Bijoux pour Google Merchant Center</description>
${items.join('\n')}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/xml; charset=UTF-8');
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Erreur génération flux Merchant Center:", error);
    return res.status(500).send('Erreur lors de la génération du flux.');
  }
};

export { addproduit, listproduits,analyzeProductImage, removeproduit, singleproduit, singleproduitBySlug, updateproduit, searchProduits, changerStatutStock, getProductFeed };