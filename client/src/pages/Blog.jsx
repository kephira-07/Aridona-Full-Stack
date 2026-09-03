import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import BoutonRetour from '../composant/BoutonRetour';

const Blog = () => {
  const { backendUrl } = useContext(ShopContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/article/list`);
        if (response.data.success) setArticles(response.data.articles);
      } catch (error) {
        console.error("Erreur chargement des articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [backendUrl]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Journal | ARIDONA Bijoux</title>
        <meta name="description" content="Conseils d'entretien, guides et actualités d'Aridona Bijoux : tout sur nos créations en acier inoxydable." />
        <link rel="canonical" href="https://aridona.store/blog" />
        <meta property="og:title" content="Journal | ARIDONA Bijoux" />
        <meta property="og:description" content="Conseils d'entretien, guides et actualités d'Aridona Bijoux." />
        <meta property="og:type" content="website" />
      </Helmet>

      <BoutonRetour />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mt-6 mb-12">
          <Titre text1="Aridona Bijoux" text2="Le Journal" />
          <p className="text-sm text-stone-500 max-w-xl mx-auto mt-2">
            Conseils d'entretien, guides et histoires autour de nos créations en acier inoxydable.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-video bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed bg-stone-50/50 max-w-2xl mx-auto px-6 text-center">
            <div className="p-4 bg-stone-100 rounded-full mb-4 text-stone-400">
              <Newspaper size={36} strokeWidth={1.5} />
            </div>
            <p className="text-stone-600 font-medium">Aucun article pour le moment</p>
            <p className="text-sm text-stone-400 mt-1">Revenez bientôt pour découvrir nos premiers articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article._id}
                to={`/blog/${article.slug}`}
                className="group flex flex-col"
              >
                <div className="aspect-video overflow-hidden rounded-xl border border-stone-100 bg-stone-50">
                  {(() => {
                    const image = article.image?.url || article.produit?.image?.[0]?.url || article.produit?.image?.[0];
                    return image ? (
                  <img
                    src={image}
                    alt={article.image?.alt || article.produit?.nom || article.titre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                    ) : null;
                  })()}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-3">
                  <Calendar size={12} />
                  <span>{new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="font-ebgaramond text-xl text-stone-900 mt-1.5 leading-snug group-hover:text-amber-800 transition-colors">
                  {article.titre}
                </h2>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed line-clamp-3">
                  {article.extrait}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 mt-3 group-hover:gap-2.5 transition-all">
                  Lire l'article
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
