import crypto from 'crypto';
import axios from 'axios';

const cleanEnv = (val) => (val ? String(val).trim().replace(/^["']+|["']+$/g, '').trim() : '');
const SITE_URL = cleanEnv(process.env.FRONTEND_URL) || 'https://aridona.store';
const GRAPH_API_VERSION = 'v21.0';

/**
 * Formate les tags d'un produit en hashtags (#AcierInoxydable, #BijouxLome, etc.)
 */
const buildHashtags = (tags = []) => {
  const baseTags = ['AridonaBijoux', 'BijouxLome', 'AcierInoxydable', 'BijouxTogo'];
  const customTags = (Array.isArray(tags) ? tags : [])
    .map((t) =>
      String(t)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
    )
    .filter(Boolean);

  const unique = [...new Set([...customTags, ...baseTags])].slice(0, 8);
  return unique.map((t) => `#${t}`).join(' ');
};

/**
 * Construit la légende complète pour Instagram
 */
export const buildInstagramCaption = (produit) => {
  const lienProduit = `${SITE_URL}/produit/${produit.slug || produit._id}`;
  const prixFormate = Number(produit.prix || 0).toLocaleString('fr-FR');
  const hashtags = buildHashtags(produit.tags);
  const couleurs = Array.isArray(produit.couleurs) && produit.couleurs.length > 0
    ? `🎨 Couleur(s) : ${produit.couleurs.join(', ')}\n`
    : '';

  return [
    `✨ NOUVEAUTÉ — ${produit.nom} ✨`,
    '',
    produit.description,
    '',
    `💎 Matière : ${produit.matiere || 'Acier Inoxydable 316L (Waterproof & Hypoallergénique)'}`,
    `${couleurs}🏷️ Prix : ${prixFormate} FCFA`,
    `🛍️ Commander sur : ${lienProduit}`,
    '',
    hashtags,
  ].join('\n');
};

/**
 * Construit le texte court (≤ 280 caractères) pour X (Twitter)
 */
export const buildXPostText = (produit) => {
  const lienProduit = `${SITE_URL}/produit/${produit.slug || produit._id}`;
  const prixFormate = Number(produit.prix || 0).toLocaleString('fr-FR');
  const hashtags = buildHashtags(produit.tags).split(' ').slice(0, 3).join(' ');

  const header = `✨ ${produit.nom} — ${prixFormate} FCFA\n`;
  const footer = `\n🛍️ ${lienProduit}\n${hashtags}`;
  // Sur X, une URL compte toujours pour 23 caractères (t.co)
  const reservedLength = header.length + 25 + hashtags.length + 6;
  const maxDescLength = Math.max(40, 275 - reservedLength);

  let desc = String(produit.description || '').trim().replace(/\s+/g, ' ');
  if (desc.length > maxDescLength) {
    desc = `${desc.slice(0, maxDescLength - 1).trimEnd()}…`;
  }

  return `${header}${desc}${footer}`;
};

/**
 * Génère l'en-tête Authorization OAuth 1.0a pour l'API X (Twitter)
 * via l'API standard Web Crypto SubtleCrypto (RFC 5849 HMAC-SHA1)
 */
const buildOAuth1Header = async ({ method, url, consumerKey, consumerSign, tokenId, tokenSign }) => {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: tokenId,
    oauth_version: '1.0',
  };

  const encode = (str) =>
    encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encode(key)}=${encode(oauthParams[key])}`)
    .join('&');

  const signatureBaseString = [
    method.toUpperCase(),
    encode(url),
    encode(paramString),
  ].join('&');

  const rawKeyData = new TextEncoder().encode(`${encode(consumerSign)}&${encode(tokenSign)}`);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKeyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(signatureBaseString)
  );
  const signature = Buffer.from(sigBuffer).toString('base64');

  const fullParams = { ...oauthParams, oauth_signature: signature };
  const headerValue = Object.keys(fullParams)
    .sort()
    .map((key) => `${encode(key)}="${encode(fullParams[key])}"`)
    .join(', ');

  return `OAuth ${headerValue}`;
};

/**
 * Résout automatiquement l'ID du compte Instagram Business à partir du jeton Meta Graph
 * si INSTAGRAM_BUSINESS_ACCOUNT_ID est omis ou correspond à l'ID d'une Page Facebook liée.
 */
let cachedIgAccountId = null;

const resolveInstagramAccountId = async (accessToken, configuredId, graphHost) => {
  if (cachedIgAccountId) return cachedIgAccountId;

  if (accessToken.startsWith('IG')) {
    if (configuredId) {
      cachedIgAccountId = configuredId;
      return cachedIgAccountId;
    }
    try {
      const meRes = await axios.get(`${graphHost}/${GRAPH_API_VERSION}/me`, {
        params: { fields: 'user_id,id', access_token: accessToken },
      });
      cachedIgAccountId = meRes.data?.user_id || meRes.data?.id || null;
      return cachedIgAccountId;
    } catch {
      return configuredId || null;
    }
  }

  // Jeton Meta Graph (EA...) : vérifier /me/accounts pour trouver le compte Instagram Business lié
  try {
    const accountsRes = await axios.get(`${graphHost}/${GRAPH_API_VERSION}/me/accounts`, {
      params: {
        fields: 'id,name,instagram_business_account,connected_instagram_account',
        access_token: accessToken,
      },
    });
    const pages = accountsRes.data?.data || [];
    for (const page of pages) {
      const igId = page.instagram_business_account?.id || page.connected_instagram_account?.id;
      if (igId) {
        cachedIgAccountId = igId;
        return cachedIgAccountId;
      }
    }
  } catch {
    // Ignorer et tenter via configuredId
  }

  if (configuredId) {
    try {
      const nodeRes = await axios.get(`${graphHost}/${GRAPH_API_VERSION}/${configuredId}`, {
        params: {
          fields: 'instagram_business_account,connected_instagram_account',
          access_token: accessToken,
        },
      });
      const linkedIgId =
        nodeRes.data?.instagram_business_account?.id ||
        nodeRes.data?.connected_instagram_account?.id;
      if (linkedIgId) {
        cachedIgAccountId = linkedIgId;
        return cachedIgAccountId;
      }
    } catch {
      // configuredId est déjà directement l'ID du compte Instagram Business
    }
  }

  cachedIgAccountId = configuredId || null;
  return cachedIgAccountId;
};

/**
 * 1. Publie un produit sur Instagram via Meta Graph API (Photo unique ou Carrousel jusqu'à 4 photos)
 */
export const publishToInstagram = async (produit) => {
  const configuredId = cleanEnv(process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID);
  const accessToken = cleanEnv(process.env.INSTAGRAM_ACCESS_TOKEN);

  if (!accessToken) {
    return {
      success: false,
      skipped: true,
      message: "Clé INSTAGRAM_ACCESS_TOKEN manquante dans .env",
    };
  }

  const imageUrls = (produit.image || [])
    .map((img) => (typeof img === 'object' ? img.url : img))
    .filter(Boolean)
    .slice(0, 4);

  if (imageUrls.length === 0) {
    return { success: false, message: "Aucune image disponible pour Instagram." };
  }

  // Les jetons issus de "API avec connexion Instagram" commencent par "IG" (graph.instagram.com),
  // tandis que ceux issus de "Connexion Facebook / Graph Explorer" commencent par "EA" (graph.facebook.com).
  const graphHost = accessToken.startsWith('IG')
    ? 'https://graph.instagram.com'
    : 'https://graph.facebook.com';

  const igUserId = await resolveInstagramAccountId(accessToken, configuredId, graphHost);
  if (!igUserId) {
    return {
      success: false,
      message: "Impossible de déterminer l'ID du compte Instagram Business. Vérifiez INSTAGRAM_BUSINESS_ACCOUNT_ID dans .env.",
    };
  }

  const caption = buildInstagramCaption(produit);
  const baseUrl = `${graphHost}/${GRAPH_API_VERSION}/${igUserId}`;

  try {
    let creationId;

    if (imageUrls.length === 1) {
      // Publication d'une photo unique
      const containerRes = await axios.post(`${baseUrl}/media`, {
        image_url: imageUrls[0],
        caption,
        access_token: accessToken,
      });
      creationId = containerRes.data.id;
    } else {
      // Publication d'un Carrousel (2 à 4 photos)
      const childIds = [];
      for (const imgUrl of imageUrls) {
        const itemRes = await axios.post(`${baseUrl}/media`, {
          image_url: imgUrl,
          is_carousel_item: true,
          access_token: accessToken,
        });
        childIds.push(itemRes.data.id);
      }

      const carouselRes = await axios.post(`${baseUrl}/media`, {
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
        access_token: accessToken,
      });
      creationId = carouselRes.data.id;
    }

    // Validation finale du conteneur média sur le profil Instagram
    const publishRes = await axios.post(`${baseUrl}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });

    return {
      success: true,
      postId: publishRes.data.id,
      message: "Publié sur Instagram avec succès !",
    };
  } catch (error) {
    const apiMsg = error.response?.data?.error?.message || error.message;
    console.error("Erreur publication Instagram :", apiMsg);
    return {
      success: false,
      message: `Erreur Instagram : ${apiMsg}`,
    };
  }
};

/**
 * 2. Publie un produit sur X (Twitter) avec ses images via l'API officielle X (OAuth 1.0a)
 */
export const publishToX = async (produit) => {
  const consumerKey = cleanEnv(process.env.X_API_KEY);
  const consumerSign = cleanEnv(process.env.X_API_SECRET);
  const tokenId = cleanEnv(process.env.X_ACCESS_TOKEN);
  const tokenSign = cleanEnv(process.env.X_ACCESS_TOKEN_SECRET);

  if (!consumerKey || !consumerSign || !tokenId || !tokenSign) {
    return {
      success: false,
      skipped: true,
      message: "Clés X (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET) manquantes dans .env",
    };
  }

  const oauthCreds = { consumerKey, consumerSign, tokenId, tokenSign };
  const imageUrls = (produit.image || [])
    .map((img) => (typeof img === 'object' ? img.url : img))
    .filter(Boolean)
    .slice(0, 4);

  try {
    // A. Upload des images vers upload.twitter.com (jusqu'à 4 photos)
    const mediaIds = [];
    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';

    for (const imgUrl of imageUrls) {
      try {
        const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const contentType = imgResponse.headers['content-type'] || 'image/jpeg';
        const formData = new FormData();
        formData.append('media', new Blob([imgResponse.data], { type: contentType }), 'bijou.jpg');

        const authHeader = await buildOAuth1Header({
          method: 'POST',
          url: uploadUrl,
          ...oauthCreds,
        });

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: { Authorization: authHeader },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.media_id_string) {
            mediaIds.push(uploadData.media_id_string);
          }
        } else {
          const errText = await uploadRes.text();
          console.warn("Avertissement upload média X :", errText);
        }
      } catch (mediaErr) {
        console.warn("Impossible d'uploader une image sur X :", mediaErr.message);
      }
    }

    // B. Création du tweet via l'API X v2
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const tweetPayload = {
      text: buildXPostText(produit),
      ...(mediaIds.length > 0 ? { media: { media_ids: mediaIds } } : {}),
    };

    const tweetAuthHeader = await buildOAuth1Header({
      method: 'POST',
      url: tweetUrl,
      ...oauthCreds,
    });

    const tweetRes = await axios.post(tweetUrl, tweetPayload, {
      headers: {
        Authorization: tweetAuthHeader,
        'Content-Type': 'application/json',
      },
    });

    const tweetId = tweetRes.data?.data?.id;
    return {
      success: true,
      tweetId,
      url: tweetId ? `https://x.com/AridonaBijoux/status/${tweetId}` : 'https://x.com/AridonaBijoux',
      message: "Publié sur X (Twitter) avec succès !",
    };
  } catch (error) {
    const apiMsg = error.response?.data?.detail || error.response?.data?.title || error.message;
    console.error("Erreur publication X :", apiMsg);
    return {
      success: false,
      message: `Erreur X : ${apiMsg}`,
    };
  }
};

/**
 * 3. Orchestrateur appelé lors de la création d'un produit (ou manuellement depuis l'Admin)
 */
export const publishProductToSocials = async (produit, { instagram = false, x = false } = {}) => {
  const results = {};

  const tasks = [];
  if (instagram) {
    tasks.push(
      publishToInstagram(produit).then((res) => {
        results.instagram = res;
      })
    );
  }
  if (x) {
    tasks.push(
      publishToX(produit).then((res) => {
        results.x = res;
      })
    );
  }

  // Support optionnel d'un Webhook Make.com / Zapier si configuré
  const webhookUrl = process.env.SOCIAL_WEBHOOK_URL?.trim();
  if (webhookUrl && (instagram || x)) {
    tasks.push(
      axios
        .post(webhookUrl, {
          platforms: { instagram, x },
          produit: {
            id: produit._id,
            nom: produit.nom,
            description: produit.description,
            prix: produit.prix,
            matiere: produit.matiere,
            couleurs: produit.couleurs,
            tags: produit.tags,
            url: `${SITE_URL}/produit/${produit.slug || produit._id}`,
            images: (produit.image || []).map((img) => img.url || img),
            instagramCaption: buildInstagramCaption(produit),
            xText: buildXPostText(produit),
          },
        })
        .then(() => {
          results.webhook = { success: true };
        })
        .catch((err) => {
          results.webhook = { success: false, message: err.message };
        })
    );
  }

  await Promise.all(tasks);
  return results;
};
