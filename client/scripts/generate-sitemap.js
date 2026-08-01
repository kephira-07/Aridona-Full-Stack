// Génère client/public/sitemap.xml avant chaque build (voir "prebuild" dans package.json).
// Inclut les pages statiques + une URL par produit (via /api/produit/list), pour que Google
// découvre les fiches produit sans attendre un crawl profond du site.
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(__dirname, '..');

// Lecture minimale du .env (pas de dépendance dotenv pour un seul script de build).
const readEnvVar = (key, fallback) => {
  const envPath = join(clientRoot, '.env');
  if (!existsSync(envPath)) return fallback;
  const line = readFileSync(envPath, 'utf-8')
    .split('\n')
    .find((l) => l.trim().startsWith(`${key}=`));
  return line ? line.split('=').slice(1).join('=').trim() : fallback;
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

const fetchProduitEntries = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/produit/list`);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.produits)) return [];

    return data.produits
      .filter((p) => p.enStock !== false) // pas d'intérêt SEO à indexer une rupture définitive
      .map((p) => ({
        loc: `/produit/${p.slug || p._id}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
      }));
  } catch (error) {
    console.warn(`[sitemap] Impossible de récupérer les produits (${BACKEND_URL}) : ${error.message}. Sitemap généré avec les pages statiques uniquement.`);
    return [];
  }
};

const fetchArticleEntries = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/article/list`);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.articles)) return [];

    return data.articles.map((a) => ({
      loc: `/blog/${a.slug}`,
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString().split('T')[0] : undefined,
    }));
  } catch (error) {
    console.warn(`[sitemap] Impossible de récupérer les articles (${BACKEND_URL}) : ${error.message}.`);
    return [];
  }
};

const produitEntries = await fetchProduitEntries();
const articleEntries = await fetchArticleEntries();
const xml = buildXml([...STATIC_PAGES, ...produitEntries, ...articleEntries]);

writeFileSync(join(clientRoot, 'public', 'sitemap.xml'), xml, 'utf-8');

// L'ancien fichier mal nommé ne doit plus traîner (robots.txt référence sitemap.xml, pas .txt).
const oldSitemapTxt = join(clientRoot, 'public', 'sitemap.txt');
if (existsSync(oldSitemapTxt)) unlinkSync(oldSitemapTxt);

const total = STATIC_PAGES.length + produitEntries.length + articleEntries.length;
console.log(`[sitemap] sitemap.xml généré avec ${total} URLs (${produitEntries.length} produits, ${articleEntries.length} articles).`);
