import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

const cleanEnvValue = (val) => (val ? String(val).trim().replace(/^["']+|["']+$/g, '').trim() : '');

// Modèles Groq disponibles par ordre de priorité
const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b'
];

// Modèles Gemini disponibles (identiques à Ajouter Produit)
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
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

/**
 * Rédige automatiquement un article de blog complet
 */
export const genererArticleAvecGroq = async ({ sujet, produit }) => {
  const systemPrompt = "Tu es le rédacteur en chef du blog d'Aridona Bijoux, expert en joaillerie durable et acier inoxydable 316L. Tu rédiges des articles de blog captivants, chaleureux et optimisés pour le référencement Google. Tu réponds UNIQUEMENT en JSON valide.";

  const detailsProduit = produit ? `Produit mis en avant : "${produit.nom}" (${produit.description || ''})` : '';

  const userPrompt = `Rédige un article de blog complet et soigné pour notre boutique en ligne.
Sujet ou orientation souhaitée : "${sujet || 'Conseils mode et entretien des bijoux en acier inoxydable'}"
${detailsProduit}

Format JSON strict attendu (sans texte autour) avec exactement ces clés :
{
  "titre": "Un titre accrocheur et optimisé SEO (moins de 70 caractères)",
  "extrait": "Un résumé engageant de 2 à 3 phrases donnant immédiatement envie de lire la suite",
  "contenu": "Le texte complet de l'article (au moins 3 ou 4 paragraphes bien développés avec conseils pratiques, astuces de style, arguments sur la durabilité et l'acier 316L, et conclusion chaleureuse)",
  "tags": ["bijoux", "acier inoxydable", "mode", "conseils", "lome"],
  "metaTitle": "Titre SEO percutant pour Google (< 65 caractères)",
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
