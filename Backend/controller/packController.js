import mongoose from 'mongoose';
import slugify from 'slugify';
import packModel from '../models/packModel.js';
import produitModel from '../models/produitModel.js';

const generateUniqueSlug = async (nom, excludeId = null) => {
  const base = slugify(nom, { lower: true, strict: true });
  let slug = base;
  let suffix = 2;
  while (await packModel.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
};

const populatePack = (query) => query.populate({
  path: 'produits.produit',
  select: 'nom slug prix image stock enStock',
});

const validateItems = async (items) => {
  if (!Array.isArray(items) || items.length < 2) return null;
  const normalized = items.map((item) => ({
    produit: item?.produit,
    quantite: Number(item?.quantite),
  }));
  if (normalized.some((item) => !mongoose.isValidObjectId(item.produit) || !Number.isInteger(item.quantite) || item.quantite < 1 || item.quantite > 20)) return null;
  const products = await produitModel.find({ _id: { $in: normalized.map((item) => item.produit) } }).select('_id');
  return products.length === normalized.length ? normalized : null;
};

export const listPacks = async (req, res) => {
  try {
    const packs = await populatePack(packModel.find({ actif: true }).sort({ createdAt: -1 }));
    res.json({ success: true, packs });
  } catch (error) {
    console.error('Erreur liste packs:', error);
    res.status(500).json({ success: false, message: 'Impossible de charger les packs.' });
  }
};

export const getPackBySlug = async (req, res) => {
  try {
    const pack = await populatePack(packModel.findOne({ slug: req.params.slug, actif: true }));
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable.' });
    res.json({ success: true, pack });
  } catch (error) {
    console.error('Erreur détail pack:', error);
    res.status(500).json({ success: false, message: 'Impossible de charger le pack.' });
  }
};

export const listPacksAdmin = async (req, res) => {
  try {
    const packs = await populatePack(packModel.find({}).sort({ createdAt: -1 }));
    res.json({ success: true, packs });
  } catch (error) {
    console.error('Erreur liste packs admin:', error);
    res.status(500).json({ success: false, message: 'Impossible de charger les packs.' });
  }
};

export const createPack = async (req, res) => {
  try {
    const { nom, description, prix, produits, actif } = req.body;
    const items = await validateItems(produits);
    const price = Number(prix);
    if (!nom?.trim() || !description?.trim() || !items || !Number.isSafeInteger(price) || price < 0) {
      return res.status(400).json({ success: false, message: 'Nom, description, produits et prix XOF valides sont obligatoires.' });
    }
    const pack = await packModel.create({ nom: nom.trim(), description: description.trim(), prix: price, produits: items, actif: actif !== false, slug: await generateUniqueSlug(nom) });
    res.status(201).json({ success: true, pack: await populatePack(packModel.findById(pack._id)) });
  } catch (error) {
    console.error('Erreur création pack:', error);
    res.status(500).json({ success: false, message: 'Impossible de créer le pack.' });
  }
};

export const updatePack = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, produits, actif } = req.body;
    const updateData = {};
    if (nom !== undefined) { updateData.nom = nom.trim(); updateData.slug = await generateUniqueSlug(nom, id); }
    if (description !== undefined) updateData.description = description.trim();
    if (prix !== undefined) {
      const price = Number(prix);
      if (!Number.isSafeInteger(price) || price < 0) return res.status(400).json({ success: false, message: 'Prix XOF invalide.' });
      updateData.prix = price;
    }
    if (produits !== undefined) {
      const items = await validateItems(produits);
      if (!items) return res.status(400).json({ success: false, message: 'Un pack doit contenir au moins deux produits valides.' });
      updateData.produits = items;
    }
    if (actif !== undefined) updateData.actif = actif === true || actif === 'true';
    const pack = await populatePack(packModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }));
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable.' });
    res.json({ success: true, pack });
  } catch (error) {
    console.error('Erreur modification pack:', error);
    res.status(500).json({ success: false, message: 'Impossible de modifier le pack.' });
  }
};

export const deletePack = async (req, res) => {
  try {
    const pack = await packModel.findByIdAndDelete(req.params.id);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable.' });
    res.json({ success: true, message: 'Pack supprimé.' });
  } catch (error) {
    console.error('Erreur suppression pack:', error);
    res.status(500).json({ success: false, message: 'Impossible de supprimer le pack.' });
  }
};
