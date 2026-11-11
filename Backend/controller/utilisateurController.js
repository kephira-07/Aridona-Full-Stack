import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import utilisateurModel from '../models/utilisateurModel.js';
import axios from 'axios';

// Helper pour générer des JWT compatibles avec le middleware auth.js
const createToken = (id, role = 'user', email = null) => {
  const payload = { id, role };
  if (email) payload.email = email;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const isSafeKey = (key) =>
  typeof key === 'string' &&
  key.length > 0 &&
  key.length <= 64 &&
  key !== '__proto__' &&
  key !== 'constructor' &&
  key !== 'prototype' &&
  !key.startsWith('$') &&
  !key.includes('.');

// 1. Connexion / Inscription 1-clic avec Google
const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token || typeof access_token !== 'string') {
      return res.status(400).json({ success: false, message: "Jeton d'accès Google manquant." });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID manquant : connexion Google refusée.");
      return res.status(503).json({ success: false, message: "Connexion Google temporairement indisponible." });
    }

    const tokenInfo = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { access_token },
    });
    if (tokenInfo.data.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Token Google non autorisé.' });
    }
    const emailVerified = tokenInfo.data.email_verified;
    if (emailVerified !== true && emailVerified !== 'true') {
      return res.status(401).json({ success: false, message: 'Adresse Google non vérifiée.' });
    }

    const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { email, name, picture, sub: googleId } = googleRes.data;
    const cleanEmail = String(email || '').trim().toLowerCase();

    let user = await utilisateurModel.findOne({ email: { $eq: cleanEmail } });

    if (!user) {
      user = await utilisateurModel.create({
        name: name || 'Membre Google',
        email: cleanEmail,
        googleId,
        avatar: picture || '',
        password: ''
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const token = createToken(user._id, user.role || 'client', user.email);
    return res.status(200).json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("Erreur Backend googleLogin:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la connexion Google." });
  }
};

// 2. Inscription / Capture Email par formulaire (sans aucun mot de passe)
const registerutilisateur = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: "Le nom et l'adresse email sont obligatoires." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Format d'adresse email invalide." });
    }

    let user = await utilisateurModel.findOne({ email: { $eq: cleanEmail } });
    if (user) {
      if (name.trim() && user.name !== name.trim()) {
        user.name = name.trim();
        await user.save();
      }
      const token = createToken(user._id, user.role || 'client', user.email);
      return res.status(200).json({ 
        success: true, 
        message: "Heureux de vous revoir !", 
        token, 
        user: { name: user.name, email: user.email } 
      });
    }

    user = await utilisateurModel.create({
      name: name.trim(),
      email: cleanEmail,
      password: '',
      role: 'client'
    });

    const token = createToken(user._id, 'client', user.email);
    return res.status(201).json({ 
      success: true, 
      message: "Bienvenue chez Aridona ! Votre adresse est enregistrée.", 
      token, 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error("Erreur Inscription:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 3. Connexion instantanée par Email (sans aucun mot de passe)
const loginutilisateur = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: "Veuillez fournir votre adresse email." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Format d'adresse email invalide." });
    }

    let user = await utilisateurModel.findOne({ email: { $eq: cleanEmail } });

    if (!user) {
      user = await utilisateurModel.create({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: '',
        role: 'client'
      });
    }

    const token = createToken(user._id, user.role || 'client', user.email);
    return res.json({ 
      success: true, 
      message: "Connexion réussie !", 
      token, 
      user: { name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error("Erreur Login Utilisateur:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 4. Connexion Administrateur
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : '';

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || !adminEmail || !process.env.ADMIN_PASSWORD_HASH) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }
    
    if (email.toLowerCase() !== adminEmail) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: 'admin_static_id', role: 'admin', email: adminEmail }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } 
    );

    return res.json({ success: true, token });

  } catch (error) {
    console.error("Erreur Admin Login:", error);
    return res.status(500).json({ success: false, message: "Une erreur interne est survenue." });
  }
};

// 5. Profil Utilisateur
const getProfilUtilisateur = async (req, res) => {
  try {
    const userId = req.userId;
    const utilisateur = await utilisateurModel.findById(userId).select("-password");
    
    if (!utilisateur) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    return res.json({ success: true, utilisateur });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 6. Mise à jour du Profil
const updateProfilUtilisateur = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, telephone, adresse, ville } = req.body;

    const updateFields = {};
    if (typeof name === 'string') updateFields.name = name.trim();
    if (typeof telephone === 'string') updateFields.telephone = telephone.trim();
    if (typeof adresse === 'string') updateFields.adresse = adresse.trim();
    if (typeof ville === 'string') updateFields.ville = ville.trim();

    const utilisateurMisAJour = await utilisateurModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    return res.json({ 
      success: true, 
      message: "Profil mis à jour avec succès !", 
      utilisateur: utilisateurMisAJour 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// 7. Liste des Utilisateurs (Réservé Admin)
const listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await utilisateurModel.find({}).select("-password").sort({ createdAt: -1 }); 
    return res.json({ success: true, utilisateurs });
  } catch (error) {
    console.error("Erreur liste utilisateurs:", error);
    return res.status(500).json({ success: false, message: "Impossible de récupérer les utilisateurs." });
  }
};

// 8. Panier utilisateur BDD
const getUtilisateurPanier = async (req, res) => {
  try {
    const userId = req.userId; 
    const userData = await utilisateurModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const cartData = userData.cartData || {};
    const cartPacks = userData.cartPacks || {};
    return res.json({ success: true, cartData, cartPacks });
  } catch (error) {
    console.error("Erreur récupération panier :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const ajouterAuPanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    if (!mongoose.isValidObjectId(itemId) || !isSafeKey(itemId) || !isSafeKey(size)) {
      return res.status(400).json({ success: false, message: "Paramètres de panier invalides." });
    }

    const userData = await utilisateurModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const cartMap = new Map(Object.entries(userData.cartData || {}));
    const sizesObj = cartMap.get(itemId);
    const sizesMap = new Map(
      sizesObj && typeof sizesObj === 'object' ? Object.entries(sizesObj) : []
    );

    const currentQty = Number(sizesMap.get(size) || 0);
    sizesMap.set(size, currentQty + 1);
    cartMap.set(itemId, Object.fromEntries(sizesMap));

    const cartData = Object.fromEntries(cartMap);
    await utilisateurModel.findByIdAndUpdate(userId, { $set: { cartData } });
    return res.json({ success: true, message: "Ajouté au panier BDD" });
  } catch (error) {
    console.error("Erreur ajout panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const updatePanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity, oldSize } = req.body;

    if (!mongoose.isValidObjectId(itemId) || !isSafeKey(itemId) || !isSafeKey(size)) {
      return res.status(400).json({ success: false, message: "Paramètres de panier invalides." });
    }
    if (oldSize !== undefined && oldSize !== null && !isSafeKey(oldSize)) {
      return res.status(400).json({ success: false, message: "Taille précédente invalide." });
    }

    const numQty = Number(quantity);
    if (!Number.isFinite(numQty)) {
      return res.status(400).json({ success: false, message: "Quantité invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const cartMap = new Map(Object.entries(userData.cartData || {}));
    const sizesObj = cartMap.get(itemId);
    const sizesMap = new Map(
      sizesObj && typeof sizesObj === 'object' ? Object.entries(sizesObj) : []
    );

    if (oldSize && oldSize !== size) {
      sizesMap.delete(oldSize);
    }

    if (numQty <= 0) {
      sizesMap.delete(size);
      if (sizesMap.size === 0) {
        cartMap.delete(itemId);
      } else {
        cartMap.set(itemId, Object.fromEntries(sizesMap));
      }
    } else {
      sizesMap.set(size, numQty);
      cartMap.set(itemId, Object.fromEntries(sizesMap));
    }

    const cartData = Object.fromEntries(cartMap);
    await utilisateurModel.findByIdAndUpdate(userId, { $set: { cartData } });
    return res.json({ success: true, message: "Panier mis à jour" });
  } catch (error) {
    console.error("Erreur mise à jour panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const deletePanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    if (!mongoose.isValidObjectId(itemId) || !isSafeKey(itemId) || !isSafeKey(size)) {
      return res.status(400).json({ success: false, message: "Paramètres de panier invalides." });
    }

    const userData = await utilisateurModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const cartMap = new Map(Object.entries(userData.cartData || {}));
    const sizesObj = cartMap.get(itemId);
    const sizesMap = new Map(
      sizesObj && typeof sizesObj === 'object' ? Object.entries(sizesObj) : []
    );

    if (sizesMap.has(size)) {
      sizesMap.delete(size);
      if (sizesMap.size === 0) {
        cartMap.delete(itemId);
      } else {
        cartMap.set(itemId, Object.fromEntries(sizesMap));
      }
      const cartData = Object.fromEntries(cartMap);
      await utilisateurModel.findByIdAndUpdate(userId, { $set: { cartData } });
      return res.json({ success: true, message: "Article supprimé du panier" });
    }

    return res.status(404).json({ success: false, message: "Article introuvable dans le panier" });
  } catch (error) {
    console.error("Erreur suppression panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const ajouterPackAuPanier = async (req, res) => {
  try {
    const userId = req.userId;
    const { packId } = req.body;

    if (!isSafeKey(packId) || !mongoose.isValidObjectId(packId)) {
      return res.status(400).json({ success: false, message: "Identifiant de pack invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const packsMap = new Map(Object.entries(userData.cartPacks || {}));
    packsMap.set(packId, Number(packsMap.get(packId) || 0) + 1);

    const cartPacks = Object.fromEntries(packsMap);
    await utilisateurModel.findByIdAndUpdate(userId, { $set: { cartPacks } });
    return res.json({ success: true, message: "Pack ajouté au panier BDD" });
  } catch (error) {
    console.error("Erreur ajout pack panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const updatePanierPack = async (req, res) => {
  try {
    const userId = req.userId;
    const { packId, quantity } = req.body;

    if (!isSafeKey(packId) || !mongoose.isValidObjectId(packId)) {
      return res.status(400).json({ success: false, message: "Identifiant de pack invalide." });
    }

    const numQty = Number(quantity);
    if (!Number.isFinite(numQty)) {
      return res.status(400).json({ success: false, message: "Quantité invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const packsMap = new Map(Object.entries(userData.cartPacks || {}));
    if (numQty <= 0) {
      packsMap.delete(packId);
    } else {
      packsMap.set(packId, numQty);
    }

    const cartPacks = Object.fromEntries(packsMap);
    await utilisateurModel.findByIdAndUpdate(userId, { $set: { cartPacks } });
    return res.json({ success: true, message: "Panier de packs mis à jour" });
  } catch (error) {
    console.error("Erreur mise à jour pack panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

const deletePanierPack = async (req, res) => {
  try {
    const userId = req.userId;
    const { packId } = req.body;

    if (!isSafeKey(packId) || !mongoose.isValidObjectId(packId)) {
      return res.status(400).json({ success: false, message: "Identifiant de pack invalide." });
    }

    const userData = await utilisateurModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    const packsMap = new Map(Object.entries(userData.cartPacks || {}));
    if (!packsMap.has(packId)) {
      return res.status(404).json({ success: false, message: "Pack introuvable dans le panier" });
    }

    packsMap.delete(packId);
    const cartPacks = Object.fromEntries(packsMap);
    await utilisateurModel.findByIdAndUpdate(userId, { $set: { cartPacks } });
    return res.json({ success: true, message: "Pack supprimé du panier" });
  } catch (error) {
    console.error("Erreur suppression pack panier BDD :", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

export { 
  registerutilisateur, 
  loginutilisateur, 
  adminLogin, 
  googleLogin, 
  getProfilUtilisateur, 
  updateProfilUtilisateur, 
  listerUtilisateurs,
  getUtilisateurPanier,
  ajouterAuPanier,
  updatePanier,
  deletePanier,
  ajouterPackAuPanier,
  updatePanierPack,
  deletePanierPack
};
