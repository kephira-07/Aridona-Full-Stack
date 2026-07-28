import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { categories } = useContext(ShopContext);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-10 border-t border-stone-700 mt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Colonne 1 : Marque, Objectif & Newsletter */}
          <div className="col-span-1 md:col-span-2 space-y-5">
            <div className="transition-transform duration-300 hover:scale-105">
              <Link to="/" onClick={scrollToTop} className="flex items-center cursor-pointer h-20 w-36">
                <img src={logo} alt="Logo Aridona Bijoux" className="object-contain w-full h-full" />
              </Link>
            </div>

            <p className="text-stone-400 font-light max-w-md leading-relaxed text-sm">
              Maison de création de bijoux et haute joaillerie fine. Authentifiez-vous pour gérer vos commandes, enregistrer vos pièces favorites et bénéficier d'une expérience personnalisée.
            </p>

            <p className="text-stone-500 font-light max-w-sm leading-relaxed text-sm"> 
              Inscrivez-vous pour recevoir les invitations à nos ventes privées et découvrir nos nouvelles créations exclusives.
            </p>
            
            {/* Formulaire Newsletter */}
            <div className="relative max-w-md pt-2">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="w-full bg-transparent border-b border-stone-600 py-2 text-stone-200 focus:outline-none focus:border-amber-500 transition-all duration-300 placeholder:text-stone-400 text-sm"
              />
              <button className="absolute right-0 bottom-2 text-amber-500 hover:text-amber-400 transition-colors duration-300 flex items-center gap-2 cursor-pointer">
                <span className="text-[11px] uppercase font-semibold tracking-[0.2em]">S'inscrire</span>
              </button>
            </div>

            {/* Contact Support */}
            <div className="pt-2 text-[12px] text-stone-400">
              Contact & Support :{' '}
              <a href="mailto:aridonabijoux@gmail.com" className="text-amber-500 hover:underline font-medium">
                aridonabijoux@gmail.com
              </a>
            </div>
          </div>

          {/* Colonne 2 : Collections Dynamiques */}
          <div className="flex flex-col">
            <h3 className="text-[12px] font-bold tracking-[0.25em] uppercase mb-6 text-stone-100">Collections</h3>
            <ul className="space-y-3.5 text-sm font-light text-stone-400">
              {categories && categories.length > 0 ? (
                categories.slice(0, 4).map((cat) => (
                  <li key={cat._id}>
                    <Link 
                      onClick={scrollToTop} 
                      to="/collection" 
                      state={{ initialCategory: cat._id }}
                      className="hover:text-amber-500 transition-colors duration-200 capitalize"
                    >
                      {cat.nom}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-colors duration-200">Haute Joaillerie</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-colors duration-200">Colliers & Pendentifs</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-colors duration-200">Bagues & Alliances</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-colors duration-200">Bracelets</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Colonne 3 : La Maison */}
          <div className="flex flex-col">
            <h3 className="text-[12px] font-bold tracking-[0.25em] uppercase mb-6 text-stone-100">La Maison</h3>
            <ul className="space-y-3.5 text-sm font-light text-stone-400">
              <li><Link onClick={scrollToTop} to="/a-propos" className="hover:text-amber-500 transition-colors duration-200">Notre Histoire</Link></li>
              <li><Link onClick={scrollToTop} to="/a-propos" className="hover:text-amber-500 transition-colors duration-200">Prendre rendez-vous</Link></li>
              <li><Link onClick={scrollToTop} to="/a-propos" className="hover:text-amber-500 transition-colors duration-200">Guide des Tailles</Link></li>
              <li><Link onClick={scrollToTop} to="/a-propos" className="hover:text-amber-500 transition-colors duration-200">Contact & Conciergerie</Link></li>
            </ul>
          </div>
        </div>

        {/* Ligne du bas : Copyright & Liens Légaux */}
        <div className="pt-8 border-t border-stone-700 flex flex-col md:flex-row items-center justify-between text-[11px] uppercase tracking-[0.2em] text-stone-500 gap-4">
          <p>&copy; {currentYear} Aridona Bijoux. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link onClick={scrollToTop} to="/politique-confidentialite" className="hover:text-stone-200 transition-colors">
              Confidentialité
            </Link>
            <Link onClick={scrollToTop} to="/conditions-utilisation" className="hover:text-stone-200 transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
