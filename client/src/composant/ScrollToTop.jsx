import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "../utils/tracker";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    if (pathname === "/commander") {
      trackEvent("checkout_start", { path: pathname, pageLabel: "Page Livraison" });
    } else if (!pathname.startsWith("/produit/")) {
      trackEvent("page_view", { path: pathname });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
