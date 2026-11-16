import backendUrl from "../config";

const getVisitorId = () => {
  try {
    let vid = localStorage.getItem("aridona_vid");
    if (!vid) {
      vid = "v-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
      localStorage.setItem("aridona_vid", vid);
    }
    return vid;
  } catch {
    return "v-anon";
  }
};

const getSavedIdentity = () => {
  try {
    const raw = localStorage.getItem("aridona_vinfo");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Enregistre l'identité du visiteur (nom, email, téléphone, ville) dès qu'il la saisit sur le site
export const identifyVisitor = ({ name, email, phone, city } = {}) => {
  try {
    const current = getSavedIdentity();
    const updated = {
      name: (name && String(name).trim()) || current.name || "",
      email: (email && String(email).trim().toLowerCase()) || current.email || "",
      phone: (phone && String(phone).trim()) || current.phone || "",
      city: (city && String(city).trim()) || current.city || "",
    };
    localStorage.setItem("aridona_vinfo", JSON.stringify(updated));
    trackEvent("identify", updated);
  } catch {
    // Silencieux
  }
};

const getDevice = () => {
  try {
    const w = window.innerWidth;
    if (w < 768) return "Mobile";
    if (w < 1024) return "Tablette";
    return "Ordinateur";
  } catch {
    return "Mobile";
  }
};

const getOsAndBrowser = () => {
  try {
    const ua = navigator.userAgent || "";
    let os = "Autre";
    if (/iPhone|iPad|iPod/i.test(ua)) os = "iPhone / iOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/Windows/i.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS/i.test(ua)) os = "Mac";

    let browser = "Navigateur";
    if (/Instagram/i.test(ua)) browser = "App Instagram";
    else if (/FBAN|FBAV/i.test(ua)) browser = "App Facebook";
    else if (/Edg\//i.test(ua)) browser = "Edge";
    else if (/Chrome\//i.test(ua)) browser = "Chrome";
    else if (/Safari\//i.test(ua)) browser = "Safari";
    else if (/Firefox\//i.test(ua)) browser = "Firefox";

    return `${os} • ${browser}`;
  } catch {
    return "";
  }
};

const getTimezoneCountry = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz === "Africa/Lome") return "Togo (Lomé)";
    if (tz === "Africa/Abidjan") return "Togo / Côte d'Ivoire";
    if (tz === "Africa/Porto-Novo") return "Bénin";
    if (tz === "Africa/Accra") return "Ghana";
    if (tz === "Africa/Dakar") return "Sénégal";
    if (tz === "Europe/Paris") return "France";
    if (tz.includes("/")) return tz.split("/")[1].replace(/_/g, " ");
    return tz;
  } catch {
    return "";
  }
};

const getTrafficSource = () => {
  try {
    const cached = sessionStorage.getItem("aridona_src");
    if (cached) return cached;

    const params = new URLSearchParams(window.location.search);
    const utm = (params.get("utm_source") || "").toLowerCase();
    const ref = (document.referrer || "").toLowerCase();
    const ua = (navigator.userAgent || "").toLowerCase();
    const combined = `${utm} ${ref} ${ua}`;

    let source = "Accès direct";
    if (combined.includes("instagram")) source = "Instagram";
    else if (combined.includes("google")) source = "Google";
    else if (combined.includes("facebook") || combined.includes("fb.") || combined.includes("fban")) source = "Facebook";
    else if (combined.includes("tiktok")) source = "TikTok";
    else if (combined.includes("whatsapp") || combined.includes("wa.me")) source = "WhatsApp";
    else if (combined.includes("twitter") || combined.includes("t.co") || combined.includes("x.com")) source = "X (Twitter)";
    else if (ref && !ref.includes(window.location.hostname)) {
      try {
        source = new URL(document.referrer).hostname.replace(/^www\./, "");
      } catch {
        source = "Lien externe";
      }
    }

    sessionStorage.setItem("aridona_src", source);
    return source;
  } catch {
    return "Accès direct";
  }
};

export const getPageLabel = (pathname = "/") => {
  if (pathname === "/") return "Accueil";
  if (pathname.startsWith("/collection")) return "Catalogue";
  if (pathname.startsWith("/produit/")) return "Fiche Bijou";
  if (pathname.startsWith("/packs") || pathname.startsWith("/pack/")) return "Packs & Coffrets";
  if (pathname.startsWith("/blog")) return "Journal / Blog";
  if (pathname.startsWith("/panier")) return "Panier";
  if (pathname.startsWith("/commander")) return "Page Livraison";
  if (pathname.startsWith("/commande-confirmee")) return "Commande Confirmée";
  if (pathname.startsWith("/favoris")) return "Favoris";
  if (pathname.startsWith("/a-propos")) return "À Propos";
  if (pathname.startsWith("/contact")) return "Contact";
  if (pathname.startsWith("/login")) return "Espace Client";
  return "Boutique";
};

export const trackEvent = (eventType, extra = {}) => {
  try {
    if (typeof window === "undefined") return;
    const pathname = extra.path || window.location.pathname || "/";
    const identity = getSavedIdentity();

    const payload = {
      visitorId: getVisitorId(),
      visitorName: extra.name || identity.name || "",
      visitorEmail: extra.email || identity.email || "",
      visitorPhone: extra.phone || identity.phone || "",
      visitorCity: extra.city || identity.city || "",
      eventType,
      path: pathname,
      pageLabel: extra.pageLabel || getPageLabel(pathname),
      produitId: extra.produitId,
      produitNom: extra.produitNom,
      device: getDevice(),
      osBrowser: getOsAndBrowser(),
      country: getTimezoneCountry(),
      source: getTrafficSource(),
    };

    fetch(`${backendUrl}/api/produit/track-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silencieux
  }
};
