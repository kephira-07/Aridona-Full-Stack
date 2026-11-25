import produitModel from "../models/produitModel.js";
import categorieModel from "../models/categorieModel.js";
import orderModel from "../models/orderModel.js";
import analyticsEventModel from "../models/analyticsEventModel.js";

const VALID_EVENTS = new Set([
  "page_view",
  "product_view",
  "add_to_cart",
  "add_to_favorites",
  "checkout_start",
  "whatsapp_click",
  "identify",
]);

const BOT_UA_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|lighthouse|headless|bingpreview|googleweblight|whatsapp|telegram|twitterbot|pinterest|bytespider|semrush|ahrefs|yandex|duckduckbot|applebot|petalbot|uptime|pagespeed|gtmetrix|puppeteer|playwright|curl|python-requests|axios|node-fetch|postman/i;

// Enregistre une action d'un visiteur réel sur le site + rapproche son identité
export const trackVisitorEvent = async (req, res) => {
  try {
    const ua = String(req.headers["user-agent"] || "").trim();
    // Ignorer les requêtes sans User-Agent et les robots/scripts pour ne compter que les vrais humains
    if (!ua || BOT_UA_REGEX.test(ua)) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const {
      visitorId,
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorCity,
      eventType,
      path = "/",
      pageLabel = "Page",
      produitId,
      produitNom,
      device,
      osBrowser = "",
      country = "",
      source = "Direct",
    } = req.body || {};

    if (!visitorId || typeof visitorId !== "string" || !VALID_EVENTS.has(eventType)) {
      return res.status(400).json({ success: false, message: "Données d'événement invalides." });
    }

    const cleanVid = visitorId.slice(0, 64);
    const validDevice = ["Mobile", "Tablette", "Ordinateur"].includes(device) ? device : "Mobile";

    // Pays détecté par Cloudflare / Render (cf-ipcountry) ou fuseau horaire envoyé par le client
    const ipCountry = String(req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || "").trim();
    const finalCountry = String(country || ipCountry || "").slice(0, 80);

    // Rapprochement automatique d'identité : si le visiteur fournit son nom, email ou téléphone,
    // on met à jour rétroactivement toutes ses visites passées ayant le même visitorId !
    const identityUpdate = {};
    if (visitorName && String(visitorName).trim()) identityUpdate.visitorName = String(visitorName).trim().slice(0, 120);
    if (visitorEmail && String(visitorEmail).trim()) identityUpdate.visitorEmail = String(visitorEmail).trim().toLowerCase().slice(0, 160);
    if (visitorPhone && String(visitorPhone).trim()) identityUpdate.visitorPhone = String(visitorPhone).trim().slice(0, 40);
    if (visitorCity && String(visitorCity).trim()) identityUpdate.visitorCity = String(visitorCity).trim().slice(0, 120);

    if (Object.keys(identityUpdate).length > 0) {
      await analyticsEventModel.updateMany(
        { visitorId: cleanVid },
        { $set: identityUpdate }
      );
    }

    // Si c'est juste une mise à jour d'identité silencieuse, inutile de créer une ligne d'action supplémentaire si déjà mis à jour
    if (eventType === "identify") {
      return res.status(200).json({ success: true });
    }

    await analyticsEventModel.create({
      visitorId: cleanVid,
      visitorName: identityUpdate.visitorName || "",
      visitorEmail: identityUpdate.visitorEmail || "",
      visitorPhone: identityUpdate.visitorPhone || "",
      visitorCity: identityUpdate.visitorCity || "",
      eventType,
      path: String(path).slice(0, 240),
      pageLabel: String(pageLabel).slice(0, 80),
      produitId: produitId ? String(produitId).slice(0, 64) : undefined,
      produitNom: produitNom ? String(produitNom).slice(0, 160) : undefined,
      device: validDevice,
      osBrowser: String(osBrowser || "").slice(0, 80),
      country: finalCountry,
      source: String(source || "Direct").slice(0, 64),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.warn("Erreur trackVisitorEvent:", error.message);
    return res.status(200).json({ success: false });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    // Togo (Africa/Lome) = UTC+0 : minuit UTC garantit la cohérence quel que soit le fuseau du serveur
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProduits,
      totalCategories,
      rupturesStock,
      totalProduitsVedette,
      commandesStats,
      bestSellersAggregation,
      zonesAggregation,
      visiteursAujourdHuiList,
      visiteurs7JoursList,
      visiteurs30JoursList,
      entonnoir30Jours,
      topBijouxConsultes,
      appareilsRepartition,
      sourcesTrafic,
      activiteRecente,
      commandesEnAttente,
      commandesAujourdHui,
      clicsWhatsappAujourdHui,
    ] = await Promise.all([
      produitModel.countDocuments({}),
      categorieModel.countDocuments({}),
      produitModel.countDocuments({ $or: [{ enStock: false }, { stock: 0 }] }),
      produitModel.countDocuments({ meilleurVente: true }),

      orderModel.aggregate([
        { $match: { status: { $ne: "Annulé" } } },
        {
          $group: {
            _id: null,
            totalCA: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      orderModel.aggregate([
        { $match: { status: { $ne: "Annulé" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items._id",
            nomStocke: { $first: "$items.nom" },
            totalVentes: { $sum: "$items.quantity" },
            totalGenere: { $sum: { $multiply: ["$items.quantity", "$items.prix"] } },
          },
        },
        {
          $lookup: {
            from: produitModel.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "details",
          },
        },
        { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } },
        { $sort: { totalVentes: -1 } },
        { $limit: 5 },
      ]),

      orderModel.aggregate([
        { $match: { status: { $ne: "Annulé" } } },
        {
          $group: {
            _id: "$address.city",
            total: { $sum: 1 },
          },
        },
      ]),

      analyticsEventModel.distinct("visitorId", { createdAt: { $gte: startOfToday } }),
      analyticsEventModel.distinct("visitorId", { createdAt: { $gte: sevenDaysAgo } }),
      analyticsEventModel.distinct("visitorId", { createdAt: { $gte: thirtyDaysAgo } }),

      analyticsEventModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: "$eventType",
            total: { $sum: 1 },
          },
        },
      ]),

      analyticsEventModel.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            eventType: { $in: ["product_view", "add_to_cart", "add_to_favorites"] },
            produitNom: { $exists: true, $nin: ["", null] },
          },
        },
        {
          $group: {
            _id: "$produitNom",
            vues: {
              $sum: { $cond: [{ $eq: ["$eventType", "product_view"] }, 1, 0] },
            },
            ajoutsPanier: {
              $sum: { $cond: [{ $eq: ["$eventType", "add_to_cart"] }, 1, 0] },
            },
            favoris: {
              $sum: { $cond: [{ $eq: ["$eventType", "add_to_favorites"] }, 1, 0] },
            },
          },
        },
        { $sort: { vues: -1, ajoutsPanier: -1 } },
        { $limit: 6 },
      ]),

      analyticsEventModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { device: "$device", visitorId: "$visitorId" },
          },
        },
        {
          $group: {
            _id: "$_id.device",
            visiteurs: { $sum: 1 },
          },
        },
        { $sort: { visiteurs: -1 } },
      ]),

      analyticsEventModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { source: "$source", visitorId: "$visitorId" },
          },
        },
        {
          $group: {
            _id: "$_id.source",
            visiteurs: { $sum: 1 },
          },
        },
        { $sort: { visiteurs: -1 } },
        { $limit: 5 },
      ]),

      // Journal des 30 dernières actions en direct avec identité
      analyticsEventModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(30)
        .select("visitorId visitorName visitorEmail visitorPhone visitorCity eventType path pageLabel produitNom device osBrowser country source createdAt")
        .lean(),

      orderModel.countDocuments({ status: { $in: ["Commande passée", "En cours de préparation"] } }),
      orderModel.countDocuments({ status: { $ne: "Annulé" }, createdAt: { $gte: startOfToday } }),
      analyticsEventModel.countDocuments({ eventType: "whatsapp_click", createdAt: { $gte: startOfToday } }),
    ]);

    const chiffreAffairesTotal = commandesStats.length > 0 ? commandesStats[0].totalCA : 0;
    const totalCommandes = commandesStats.length > 0 ? commandesStats[0].count : 0;

    const produitsPlusVendus = bestSellersAggregation.map((item) => ({
      nom: item.details?.nom || item.nomStocke || "Article",
      ventes: item.totalVentes,
      totalGenere: item.totalGenere,
    }));

    const produitsVedetteList = await produitModel
      .find({ meilleurVente: true })
      .limit(5)
      .select("nom categorie")
      .populate("categorie", "nom");

    const produitsVedette = produitsVedetteList.map((p) => ({
      nom: p.nom,
      categorie: p.categorie?.nom || "Bijoux",
    }));

    // Fusionne les variantes de casse/accents/espaces (ex: "Lomé", "lome", "Lome ")
    const zonesMap = new Map();
    for (const z of zonesAggregation) {
      const raw = String(z._id || "").trim();
      const label = raw || "Non spécifiée";
      const key = label
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const existing = zonesMap.get(key);
      if (existing) {
        existing.total += z.total;
        // Préférer un libellé avec majuscule/accent (ex: "Lomé" plutôt que "lome")
        if (/[À-ÿ]/.test(label) && !/[À-ÿ]/.test(existing.zone)) {
          existing.zone = label;
        }
      } else {
        const formatted = label === label.toLowerCase()
          ? label.charAt(0).toUpperCase() + label.slice(1)
          : label;
        zonesMap.set(key, { zone: formatted, total: z.total });
      }
    }
    const zonesPlusDemandees = Array.from(zonesMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const zoneTop = zonesPlusDemandees.length > 0 ? zonesPlusDemandees[0].zone : "N/A";

    const countsByType = {};
    for (const item of entonnoir30Jours) {
      countsByType[item._id] = item.total;
    }

    const behavior = {
      visiteursAujourdHui: visiteursAujourdHuiList.length,
      visiteurs7Jours: visiteurs7JoursList.length,
      visiteurs30Jours: visiteurs30JoursList.length,
      entonnoir: {
        // product_view et checkout_start sont aussi des pages consultées (évite Bijoux Vus > Pages Vues)
        pagesVues:
          (countsByType.page_view || 0) +
          (countsByType.product_view || 0) +
          (countsByType.checkout_start || 0),
        vuesProduits: countsByType.product_view || 0,
        ajoutsPanier: countsByType.add_to_cart || 0,
        ajoutsFavoris: countsByType.add_to_favorites || 0,
        debutsCommande: countsByType.checkout_start || 0,
        clicsWhatsapp: countsByType.whatsapp_click || 0,
      },
      topBijouxConsultes: topBijouxConsultes.map((b) => ({
        nom: b._id,
        vues: b.vues,
        ajoutsPanier: b.ajoutsPanier,
        favoris: b.favoris,
      })),
      appareils: appareilsRepartition.map((a) => ({
        device: a._id || "Mobile",
        visiteurs: a.visiteurs,
      })),
      sources: sourcesTrafic.map((s) => ({
        source: s._id || "Direct",
        visiteurs: s.visiteurs,
      })),
      activiteRecente: activiteRecente.map((ev) => ({
        visitorCode: String(ev.visitorId || "").slice(-4).toUpperCase(),
        visitorName: ev.visitorName || "",
        visitorEmail: ev.visitorEmail || "",
        visitorPhone: ev.visitorPhone || "",
        visitorCity: ev.visitorCity || "",
        eventType: ev.eventType,
        path: ev.path,
        pageLabel: ev.pageLabel,
        produitNom: ev.produitNom || "",
        device: ev.device || "Mobile",
        osBrowser: ev.osBrowser || "",
        country: ev.country || "",
        source: ev.source || "Direct",
        createdAt: ev.createdAt,
      })),
    };

    return res.status(200).json({
      success: true,
      stats: {
        chiffreAffairesTotal,
        totalProduitsVedette,
        totalCommandes,
        zoneTop,
        produitsPlusVendus,
        produitsVedette,
        zonesPlusDemandees,
        totalProduits,
        totalCategories,
        rupturesStock,
        commandesEnAttente,
        commandesAujourdHui,
        clicsWhatsappAujourdHui,
        behavior,
      },
    });
  } catch (error) {
    console.error("Erreur Dashboard Stats Réelles:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du calcul des statistiques réelles",
    });
  }
};

const ACTION_LABELS = {
  page_view: "Page visitée",
  product_view: "Bijou consulté",
  add_to_cart: "Ajouté au panier",
  add_to_favorites: "Mis en favoris",
  checkout_start: "Étape Livraison",
  whatsapp_click: "Clic WhatsApp",
};

const escapeCsvField = (val) => {
  const str = String(val ?? "").replace(/"/g, '""');
  return `"${str}"`;
};

// Téléchargement complet de l'historique d'activité en CSV (compatible Excel)
export const exportAnalyticsCSV = async (req, res) => {
  try {
    const events = await analyticsEventModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    const header = [
      "Date & Heure",
      "Code Visiteur",
      "Nom Client",
      "Email",
      "Téléphone WhatsApp",
      "Ville / Quartier",
      "Action",
      "Bijou / Détail",
      "Page",
      "URL",
      "Appareil",
      "Système & Navigateur",
      "Pays / Zone",
      "Provenance",
    ].join(";");

    const rows = events.map((ev) => {
      const dateStr = ev.createdAt
        ? new Date(ev.createdAt).toLocaleString("fr-FR", { timeZone: "Africa/Lome" })
        : "";
      const visitorCode = "#" + String(ev.visitorId || "").slice(-4).toUpperCase();
      const actionLabel = ACTION_LABELS[ev.eventType] || ev.eventType;
      const detail = ev.produitNom || ev.pageLabel || "";

      return [
        escapeCsvField(dateStr),
        escapeCsvField(visitorCode),
        escapeCsvField(ev.visitorName || ""),
        escapeCsvField(ev.visitorEmail || ""),
        escapeCsvField(ev.visitorPhone || ""),
        escapeCsvField(ev.visitorCity || ""),
        escapeCsvField(actionLabel),
        escapeCsvField(detail),
        escapeCsvField(ev.pageLabel || ""),
        escapeCsvField(ev.path || ""),
        escapeCsvField(ev.device || ""),
        escapeCsvField(ev.osBrowser || ""),
        escapeCsvField(ev.country || ""),
        escapeCsvField(ev.source || ""),
      ].join(";");
    });

    const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="aridona-activite-visiteurs-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Erreur export CSV analytique:", error);
    return res.status(500).json({
      success: false,
      message: "Impossible d'exporter l'historique d'activité.",
    });
  }
};
