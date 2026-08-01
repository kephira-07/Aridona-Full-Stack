import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Calendar, Tag } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import BoutonRetour from '../composant/BoutonRetour';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { backendUrl } = useContext(ShopContext);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await axios.get(`${backendUrl}/api/article/single/${slug}`);
        if (response.data.success) {
          setArticle(response.data.article);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Erreur chargement de l'article:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, backendUrl]);

  // Tronque un texte à n caractères, pour le repli meta description.
  const truncate = (str, n) => {
    if (!str) return '';
    if (str.length <= n) return str;
    return `${str.slice(0, n - 1).trimEnd()}…`;
  };

  if (loading) {
    return (
      <div className="text-center py-40 text-stone-400 text-sm italic animate-pulse">
        Chargement de l'article...
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="text-center py-40 px-4">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <p className="text-stone-800 font-medium mb-2">Article introuvable</p>
        <Link to="/blog" className="text-amber-700 text-sm font-semibold hover:underline">
          Retour au journal
        </Link>
      </div>
    );
  }

  const pageTitle = article.metaTitle || `${article.titre} | ARIDONA Bijoux`;
  const pageDescription = article.metaDescription || truncate(article.extrait, 160);
  const canonicalUrl = `https://aridona.store/blog/${article.slug}`;

  const paragraphes = (article.contenu || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "BlogPosting",
    "headline": article.titre,
    "description": article.extrait,
    "image": article.image?.url,
    "author": { "@type": "Organization", "name": article.auteur || "Aridona Bijoux" },
    "publisher": { "@type": "Organization", "name": "Aridona Bijoux" },
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt || article.createdAt,
    "mainEntityOfPage": canonicalUrl,
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={article.image?.url} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <BoutonRetour />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <header className="text-center mt-6 mb-8">
          <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 mb-3">
            <Calendar size={13} />
            <span>{new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="mx-1">·</span>
            <span>{article.auteur || 'Aridona Bijoux'}</span>
          </div>
          <h1 className="font-ebgaramond text-3xl md:text-4xl text-stone-900 tracking-wide leading-tight">
            {article.titre}
          </h1>
        </header>

        <div className="aspect-video rounded-xl overflow-hidden border border-stone-100 mb-10">
          <img
            src={article.image?.url}
            alt={article.image?.alt || article.titre}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-stone max-w-none text-stone-700 text-base leading-relaxed space-y-5">
          {paragraphes.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-stone-100">
            <Tag size={14} className="text-stone-400" />
            {article.tags.map((tag, idx) => (
              <span key={idx} className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-800 hover:text-amber-900 transition-colors"
          >
            ← Retour au journal
          </Link>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;
