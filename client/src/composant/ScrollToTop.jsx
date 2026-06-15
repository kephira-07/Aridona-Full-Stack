import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // On remonte en haut de la page dès que l'URL (pathname) change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Ce composant n'affiche rien visuellement
};

export default ScrollToTop;