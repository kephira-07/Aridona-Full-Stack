// Génère client/public/sitemap.xml avant chaque build (voir "prebuild" dans package.json).
// Inclut les pages statiques + une URL par produit (via /api/produit/list), pour que Google
// découvre les fiches produit sans attendre un crawl profond du site.
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(__dirname, '..');

// Lecture améliorée du fichier .env (supporte .env et .env.local, gère les espaces et guillemets)
const readEnvVar = (key, fallback) => {
  const envFiles = ['.env.local', '.env.production', '.env'];
  for (const file of envFiles) {
    const envPath = join(clientRoot, file);
    if (existsSync(envPath)) {
      const lines = readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [envKey, ...valParts] = trimmed.split('=');
        if (envKey.trim() === key) {
          return valParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return fallback;
};

const SITE_URL = 'https://aridona.store';
const BACKEND_URL = process.env.VITE_BACKEND_URL || readEnvVar('VITE_BACKEND_URL', SITE_URL);

const STATIC_PAGES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/collection', changefreq: 'daily', priority: '0.8' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.6' },
  { loc: '/a-propos', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.4' },
  { loc: '/conditions-utilisation', changefreq: 'yearly', priority: '0.2' },
  { loc: '/politique-confidentialite', changefreq: 'yearly', priority: '0.2' },
];

const escapeXml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urlEntry = ({ loc, changefreq, priority, lastmod }) => `  <url>
    <loc>${escapeXml(SITE_URL + loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const buildXml = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join('\n')}
</urlset>
`;

// Helper sécurisé pour exécuter un fetch d'API
const safeFetchJson = async (endpoint) => {
  const url = `${BACKEND_URL}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[sitemap] Échec HTTP ${response.status} sur ${url}`);
      return null;
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`[sitemap] Réponse non-JSON reçue sur ${url} (probablement du HTML). Vérifiez BACKEND_URL.`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`[sitemap] Erreur réseau lors de l'appel à ${url} : ${error.message}`);
    return null;
  }
};

const fetchProduitEntries = async () => {
  const data = await safeFetchJson('/api/produit/list');
  if (!data || !data.success || !Array.isArray(data.produits)) {
    console.warn(`[sitemap] Impossible de récupérer les produits. Sitemap généré avec les pages statiques.`);
    return [];
  }

  return data.produits
    .filter((p) => p.enStock !== false)
    .map((p) => ({
      loc: `/produit/${p.slug || p._id}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
    }));
};

const fetchArticleEntries = async () => {
  const data = await safeFetchJson('/api/article/list');
  if (!data || !data.success || !Array.isArray(data.articles)) {
    console.warn(`[sitemap] Impossible de récupérer les articles.`);
    return [];
  }

  return data.articles.map((a) => ({
    loc: `/blog/${a.slug}`,
    changefreq: 'monthly',
    priority: '0.5',
    lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : undefined,
  }));
};

console.log(`[sitemap] Connexion au backend sur : ${BACKEND_URL}`);

const produitEntries = await fetchProduitEntries();
const articleEntries = await fetchArticleEntries();
const xml = buildXml([...STATIC_PAGES, ...produitEntries, ...articleEntries]);

writeFileSync(join(clientRoot, 'public', 'sitemap.xml'), xml, 'utf-8');

// L'ancien fichier mal nommé ne doit plus traîner
const oldSitemapTxt = join(clientRoot, 'public', 'sitemap.txt');
if (existsSync(oldSitemapTxt)) unlinkSync(oldSitemapTxt);

const total = STATIC_PAGES.length + produitEntries.length + articleEntries.length;
console.log(`[sitemap] sitemap.xml généré avec ${total} URLs (${produitEntries.length} produits, ${articleEntries.length} articles).`);