import mongoose from 'mongoose';
import produitModel from '../models/produitModel.js';
import { v2 as cloudinary } from 'cloudinary';
import generateUniqueSlug from '../utils/slug.js';
import { GoogleGenAI } from '@google/genai';
import { cleanLocalFiles } from '../utils/cleanLocalFile.js';
import { publishProductToSocials } from '../utils/socialPublisher.js';

// Initialisation du SDK Google GenAI (supporte les clés Google AI Studio "AIza..." et Vertex AI Express "AQ....")
const cleanEnvValue = (val) => (val ? String(val).trim().replace(/^["']+|["']+$/g, '').trim() : '');

const getGenAIClient = () => {
  const apiKey = cleanEnvValue(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("La variable GEMINI_API_KEY est manquante dans la configuration du serveur (.env / Render).");
  }
  const isVertexExpressKey = apiKey.startsWith('AQ.');
  return new GoogleGenAI({
    apiKey,
    ...(isVertexExpressKey ? { vertexai: true } : {}),
  });
};

// Contrôleur pour l'analyse IA (Gemini)
const analyzeProductImage = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, message: "Aucune image fournie." });
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const ai = getGenAIClient();

    const prompt = [
      "Tu es un expert en e-commerce de bijoux en acier inoxydable pour Aridona Bijoux.",
      "Analyse l'image de ce bijou et génère une fiche produit au format JSON strict (sans aucun texte autour, sans balises markdown).",
      "Le JSON doit contenir exactement ces clés :",
      '- "nom": Un titre élégant et vendeur en français.',
      '- "description": Une description poétique et raffinée mettant en valeur la résistance et l\'acier inoxydable.',
      '- "tags": Une chaîne de 4 à 6 mots-clés séparés par des virgules (ex: "collier, acier inoxydable, doré, minimaliste").',
      '- "metaTitle": Un titre SEO accrocheur de moins de 70 caractères.',
      '- "metaDescription": Une description SEO engageante de moins de 160 caractères.',
      '- "couleurs": Un tableau parmi ces choix exacts selon la couleur dominante: ["Doré", "Argenté", "Rosé"].',
      '- "alt": Un texte alternatif SEO court décrivant visuellement le bijou sur la photo.'
    ].join('\n');

    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let response = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg',
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response) break;
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`Échec modèle ${modelName}:`, modelErr.message);
      }
    }

    if (!response) {
      throw lastError || new Error("Aucun modèle Gemini n'a pu répondre.");
    }

    // Récupération sécurisée du texte généré
    const candidateText =
      (typeof response.text === 'function' ? response.text() : response.text) ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      '';
    let rawText = String(candidateText).trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }

    const productData = JSON.parse(rawText);

    // Normalisation au cas où Gemini renvoie tags sous forme de tableau
    if (Array.isArray(productData.tags)) {
      productData.tags = productData.tags.join(', ');
    }

    return res.json({ success: true, product: productData });

  } catch (error) {
    console.error("Erreur détaillée analyse Gemini :", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'analyse de l'image par l'IA."
    });
  }
};

// Helper pour parser les tableaux (sizes, couleurs) en toute sécurité
const parseArrayHelper = (input) => {
  if (!input) return [];
  try {
    if (Array.isArray(input)) return input.map((v) => (typeof v === 'object' ? v : String(v)));
    const cleanInput = typeof input === 'string' ? input.trim() : input;
    return JSON.parse(cleanInput);
  } catch (e) {
    if (typeof input === 'string') {
      return input.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
};

const listproduits = async (req, res) => {
  try {
    const { categorieId } = req.query;
    const filtre = {};

    if (categorieId !== undefined) {
      if (typeof categorieId !== 'string' || !mongoose.isValidObjectId(categorieId)) {
        return res.status(400).json({ success: false, message: "Identifiant de catégorie invalide." });
      }
      filtre.categorie = { $eq: categorieId };
    }

    const produits = await produitModel.find(filtre).populate("categorie", "nom name");

    return res.status(200).json({ success: true, produits });
  } catch (error) {
    console.error("Erreur listproduits :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
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

const parseTagsHelper = (input) => {
  const rawArray = parseArrayHelper(input);
  return rawArray.map(tag => String(tag).trim().toLowerCase()).filter(Boolean);
};

const LEGACY_COULEURS = { 'Or Rose': 'Rosé' };
const parseCouleursHelper = (input) => parseArrayHelper(input).map((c) => LEGACY_COULEURS[String(c)] || String(c));

// 1. Ajouter un produit
const addproduit = async (req, res) => {
  try {
    const { nom, description, prix, categorie, matiere, couleurs, sizes, tags, meilleurVente, stock, alts, metaTitle, metaDescription, publishInstagram, publishX } = req.body;

    if (!nom || !description || !prix || !categorie || typeof nom !== 'string' || typeof description !== 'string' || typeof categorie !== 'string' || !mongoose.isValidObjectId(categorie)) {
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

    cleanLocalFiles(req.files);

    const slug = await generateUniqueSlug(produitModel, nom);
    const parsedSizes = parseArrayHelper(sizes).map(String);
    const parsedCouleurs = parseCouleursHelper(couleurs);
    const parsedTags = parseTagsHelper(tags);

    const stockValue = stock === '' || stock === undefined ? null : Number(stock);
    if (stockValue !== null && (!Number.isInteger(stockValue) || stockValue < 0)) {
      return res.status(400).json({ success: false, message: "Le stock doit être un entier positif ou nul." });
    }

    const produitData = {
      nom: nom.trim(),
      description: description.trim(),
      prix: prixValue,
      categorie,
      matiere: typeof matiere === 'string' && matiere.trim() ? matiere.trim() : "Acier Inoxydable",
      couleurs: parsedCouleurs.length > 0 ? parsedCouleurs : ["Doré"],
      sizes: parsedSizes,
      tags: parsedTags,
      meilleurVente: meilleurVente === "true" || meilleurVente === true,
      stock: stockValue,
      enStock: stockValue === null ? true : stockValue > 0,
      image: imageDocs,
      slug,
      metaTitle: typeof metaTitle === 'string' ? metaTitle.trim() : undefined,
      metaDescription: typeof metaDescription === 'string' ? metaDescription.trim() : undefined,
    };

    const produit = new produitModel(produitData);
    await produit.save();

    // Publication automatique sur Instagram et/ou X (Twitter) si cochée dans l'Admin
    const wantInstagram = publishInstagram === 'true' || publishInstagram === true;
    const wantX = publishX === 'true' || publishX === true;
    let social = null;
    if (wantInstagram || wantX) {
      social = await publishProductToSocials(produit, {
        instagram: wantInstagram,
        x: wantX,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Produit ajouté avec succès !",
      produit,
      social,
    });
  } catch (error) {
    cleanLocalFiles(req.files);
    console.error("Erreur ajout produit:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 2. Supprimer un produit
const removeproduit = async (req, res) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Identifiant de produit invalide." });
    }
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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 3. Produit unique
const singleproduit = async (req, res) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Identifiant de produit invalide." });
    }
    const produit = await produitModel.findById(id).populate("categorie");

    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({ success: true, produit });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const singleproduitBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== 'string') {
      return res.status(400).json({ success: false, message: "Slug invalide." });
    }
    const produit = await produitModel.findOne({ slug: { $eq: slug } }).populate("categorie");

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

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      cleanLocalFiles(req.files);
      return res.status(400).json({ success: false, message: "Identifiant de produit invalide." });
    }

    const updateData = {};
    if (typeof nom === 'string' && nom.trim()) {
      updateData.nom = nom.trim();
      updateData.slug = await generateUniqueSlug(produitModel, nom.trim(), id);
    }
    if (typeof description === 'string' && description.trim()) {
      updateData.description = description.trim();
    }
    if (prix !== undefined) {
      const prixValue = Number(prix);
      if (!Number.isSafeInteger(prixValue) || prixValue < 0) {
        cleanLocalFiles(req.files);
        return res.status(400).json({ success: false, message: "Le prix doit être un entier XOF valide." });
      }
      updateData.prix = prixValue;
    }
    if (typeof categorie === 'string' && mongoose.isValidObjectId(categorie)) {
      updateData.categorie = categorie;
    }
    if (typeof matiere === 'string' && matiere.trim()) {
      updateData.matiere = matiere.trim();
    }
    if (couleurs) updateData.couleurs = parseCouleursHelper(couleurs);
    if (sizes) updateData.sizes = parseArrayHelper(sizes).map(String);
    if (tags !== undefined) updateData.tags = parseTagsHelper(tags);
    if (meilleurVente !== undefined) updateData.meilleurVente = (meilleurVente === "true" || meilleurVente === true);
    if (stock !== undefined) {
      const stockValue = stock === '' ? null : Number(stock);
      if (stockValue !== null && (!Number.isInteger(stockValue) || stockValue < 0)) {
        return res.status(400).json({ success: false, message: "Le stock doit être un entier positif ou nul." });
      }
      updateData.stock = stockValue;
      if (stockValue !== null) {
        const stockActuel = await produitModel.findById(id).select('stock');
        if (!stockActuel || stockActuel.stock !== stockValue) {
          updateData.enStock = stockValue > 0;
        }
      }
    }
    if (typeof metaTitle === 'string') updateData.metaTitle = metaTitle.trim();
    if (typeof metaDescription === 'string') updateData.metaDescription = metaDescription.trim();

    let ancienProduit = null;
    let removedPublicIds = [];
    if (imagesManifest !== undefined) {
      const manifest = parseArrayHelper(imagesManifest);
      ancienProduit = await produitModel.findById(id);
      if (!ancienProduit) {
        cleanLocalFiles(req.files);
        return res.status(404).json({ success: false, message: "Produit introuvable" });
      }
      const nomPourAlt = (typeof nom === 'string' && nom.trim()) || ancienProduit.nom || '';

      const finalImages = [];
      const keptPublicIds = new Set();

      for (let i = 0; i < manifest.length; i++) {
        const slot = manifest[i];
        if (!slot || slot.type === 'empty') continue;

        if (slot.type === 'existing' && typeof slot.publicId === 'string' && typeof slot.url === 'string') {
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
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("categorie");

    if (!produitModifie) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    for (const publicId of removedPublicIds) {
      await cloudinary.uploader.destroy(publicId);
    }

    return res.status(200).json({ success: true, message: "Produit modifié avec succès !", produit: produitModifie });
  } catch (error) {
    cleanLocalFiles(req.files);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 5. Rechercher des produits
const searchProduits = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
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

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Identifiant de produit invalide." });
    }

    if (enStock === undefined) {
      return res.status(400).json({ success: false, message: "Le statut enStock est obligatoire." });
    }

    const produit = await produitModel.findByIdAndUpdate(
      id,
      { $set: { enStock: enStock === true || enStock === 'true' } },
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
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 8. Flux produits pour Google Merchant Center
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
        .slice(0, 10)
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

// 9. Partager un produit existant sur Instagram et/ou X
const shareProduitSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const { instagram = false, x = false } = req.body;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Identifiant de produit invalide." });
    }

    const produit = await produitModel.findById(id);
    if (!produit) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    const social = await publishProductToSocials(produit, {
      instagram: Boolean(instagram),
      x: Boolean(x),
    });

    return res.status(200).json({
      success: true,
      message: "Diffusion sur les réseaux sociaux terminée.",
      social,
    });
  } catch (error) {
    console.error("Erreur partage réseaux sociaux:", error);
    return res.status(500).json({ success: false, message: "Erreur lors du partage sur les réseaux sociaux." });
  }
};

export { addproduit, listproduits, analyzeProductImage, removeproduit, singleproduit, singleproduitBySlug, updateproduit, searchProduits, changerStatutStock, getProductFeed, shareProduitSocial };
