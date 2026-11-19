import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

const cleanEnvValue = (val) => (val ? String(val).trim().replace(/^["']+|["']+$/g, '').trim() : '');

// Modèles Groq disponibles par ordre de priorité
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'qwen/qwen3-32b',
];

// Modèles Gemini disponibles (identiques à Ajouter Produit)
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
];

/**
 * Envoie un prompt à l'IA (Groq si GROQ_API_KEY est configurée, sinon utilise automatiquement
 * la clé GEMINI_API_KEY déjà active sur Ajouter Produit)
 */
export const callGroqChat = async ({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 1500 }) => {
  const groqKey = cleanEnvValue(process.env.GROQ_API_KEY) ||
    (cleanEnvValue(process.env.GEMINI_API_KEY).startsWith('gsk_') ? cleanEnvValue(process.env.GEMINI_API_KEY) : '');
  const geminiKey = !cleanEnvValue(process.env.GEMINI_API_KEY).startsWith('gsk_')
    ? cleanEnvValue(process.env.GEMINI_API_KEY)
    : '';

  let lastError = null;

  // 1. Si une clé Groq est disponible, on passe par Groq
  if (groqKey) {
    for (const model of GROQ_MODELS) {
      try {
        const messages = [];
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: userPrompt });

        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          },
          {
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return content.trim();
        }
      } catch (err) {
        lastError = err;
        const errMsg = err.response?.data?.error?.message || err.message;
        console.warn(`Tentative Groq avec ${model} échouée :`, errMsg);
      }
    }
  }

  // 2. Relais automatique sur la clé IA déjà active sur Ajouter Produit (GEMINI_API_KEY sur Render)
  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

    for (const modelName of GEMINI_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });
        const candidateText =
          (typeof response.text === 'function' ? response.text() : response.text) ||
          response.candidates?.[0]?.content?.parts?.[0]?.text ||
          '';
        if (candidateText && String(candidateText).trim()) {
          return String(candidateText).trim();
        }
      } catch (err) {
        lastError = err;
        console.warn(`Tentative Gemini avec ${modelName} échouée :`, err.message);
      }
    }
  }

  throw lastError || new Error("Aucune clé IA valide (GROQ_API_KEY ou GEMINI_API_KEY) n'a pu répondre.");
};

/**
 * Extrait et parse un bloc JSON propre depuis une réponse LLM
 */
const parseJsonFromResponse = (raw) => {
  let cleaned = String(raw)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    cleaned = match[0];
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    // Répare les retours à la ligne non échappés à l'intérieur des chaînes JSON
    const repaired = cleaned.replace(/"((?:[^"\\]|\\.)*)"/g, (fullMatch) =>
      fullMatch.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t')
    );
    return JSON.parse(repaired);
  }
};

/**
 * Génère automatiquement une offre pack complète
 */
export const genererPackAvecGroq = async ({ produits = [] }) => {
  const systemPrompt = "Tu es un expert en marketing e-commerce pour 'Aridona Bijoux' (spécialiste des bijoux raffinés en acier inoxydable 316L, waterproof et hypoallergéniques à Lomé, Togo). Tu réponds UNIQUEMENT en JSON valide.";

  const descriptionsProduits = produits.map((p, idx) => {
    return `${idx + 1}. ${p.nom || 'Bijou'} (Prix unitaire: ${p.prix || 0} FCFA) - ${p.description || ''}`;
  }).join('\n');

  const sommePrix = produits.reduce((sum, p) => sum + (Number(p.prix) || 0) * (Number(p.quantite) || 1), 0);

  const userPrompt = `Voici les bijoux sélectionnés pour composer un pack spécial / coffret cadeau :
${descriptionsProduits}

Total prix individuel indicatif : ${sommePrix} FCFA.

Génère une proposition commerciale attractive en JSON strict (sans texte autour, sans markdown) avec exactement ces clés :
{
  "nom": "Un nom de pack poétique et prestigieux (ex: 'Coffret Éclat & Passion')",
  "description": "Une description vendeuse et élégante de 3 à 5 phrases mettant en avant l'harmonie des bijoux ensemble, la résistance de l'acier inoxydable 316L (douche, mer) et la parfaite idée cadeau.",
  "prixSuggere": ${sommePrix > 0 ? Math.round(sommePrix * 0.88 / 500) * 500 : 5000}
}
Note : 'prixSuggere' doit être un nombre entier en FCFA (arrondi à 500 FCFA près).`;

  const raw = await callGroqChat({ systemPrompt, userPrompt, temperature: 0.7, maxTokens: 800 });
  return parseJsonFromResponse(raw);
};

const ANGLES_EDITORIAL = [
  "Conseils look & association mode : comment porter ce bijou au quotidien, au bureau ou en soirée à Lomé (layering, superposition, accord avec les tenues)",
  "Guide d'achat & tendances bijoux au Togo : pourquoi ce style de bijou est l'indispensable de la saison pour sublimer sa silhouette",
  "Idée cadeau parfaite à Lomé : pourquoi offrir ce bijou (anniversaire, fête, surprise) et comment choisir la pièce idéale qui dure toute une vie",
  "Bijoux & climat tropical au Togo : comment rester élégante à la plage, sous la chaleur ou la pluie avec des bijoux waterproof et hypoallergéniques",
  "Morphologie & style personnel : comment choisir et associer ce bijou pour mettre en valeur son teint, son cou, ses mains ou son poignet",
  "Histoire & symbolique du bijou : l'élégance intemporelle, la confiance en soi et l'art d'accessoiriser une tenue minimaliste ou chic",
];

/**
 * Rédige automatiquement un article de blog complet et varié
 */
export const genererArticleAvecGroq = async ({ sujet, produit }) => {
  const systemPrompt = "Tu es le rédacteur en chef mode & lifestyle du blog d'Aridona Bijoux (boutique de vente de bijoux en ligne à Lomé, Togo). Tu rédiges des articles variés, inspirants, chaleureux et optimisés pour le SEO Google au Togo (acheter des bijoux au Togo, tendances mode Lomé, idées cadeaux, guides de style). INTERDICTION de faire un article centré uniquement sur le nettoyage ou l'entretien sauf si le sujet le demande explicitement. Tu réponds UNIQUEMENT en JSON valide.";

  const angleAleatoire = ANGLES_EDITORIAL[Math.floor(Math.random() * ANGLES_EDITORIAL.length)];
  const orientation = (sujet && sujet.trim())
    ? sujet.trim()
    : (produit
        ? `${angleAleatoire} — autour de notre création "${produit.nom}"`
        : angleAleatoire);

  const detailsProduit = produit ? `Produit mis en avant dans l'article : "${produit.nom}" (${produit.description || ''})` : '';

  const userPrompt = `Rédige un article de blog complet, original et captivant pour notre boutique de bijoux en ligne à Lomé, Togo (Aridona Bijoux).
Angle et sujet précis de l'article : "${orientation}"
${detailsProduit}

Consignes éditoriales importantes :
- Ne fais PAS un énième guide sur "comment nettoyer/entretenir l'acier inoxydable".
- Parle de style, d'élégance, d'idées de looks, d'occasions (soirée, bureau, cadeau, mariage, plage à Lomé), de tendances mode au Togo, et explique pourquoi acheter ce bijou sur Aridona Bijoux est un coup de cœur durable (waterproof, ne noircit pas, livraison rapide à Lomé et partout au Togo).
- Intègre naturellement des mots-clés SEO locaux comme "acheter des bijoux au Togo", "boutique de bijoux à Lomé", "Aridona Bijoux".

Format JSON strict attendu (sans texte autour) avec exactement ces clés :
{
  "titre": "Un titre accrocheur, original et optimisé SEO (moins de 70 caractères, sans le mot 'entretien')",
  "extrait": "Un résumé engageant de 2 à 3 phrases donnant immédiatement envie de lire la suite",
  "contenu": "Le texte complet de l'article (3 à 4 paragraphes riches et bien développés, séparés par une ligne vide \\n\\n)",
  "tags": ["bijoux togo", "mode lome", "style", "idee cadeau", "aridona bijoux"],
  "metaTitle": "Titre SEO percutant pour Google au Togo (< 65 caractères)",
  "metaDescription": "Méta description SEO engageante avec appel à l'action (< 155 caractères)"
}`;

  const raw = await callGroqChat({ systemPrompt, userPrompt, temperature: 0.7, maxTokens: 1800 });
  const data = parseJsonFromResponse(raw);

  // Normalisation des tags si chaîne
  if (typeof data.tags === 'string') {
    data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  return data;
};
