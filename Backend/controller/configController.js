import { FRAIS_LIVRAISON, SEUIL_LIVRAISON_GRATUITE, SEUIL_REDUCTION, TAUX_REDUCTION } from '../config/siteConfig.js';

// Réglages publics lus par le client au démarrage (ShopContext)
const getConfig = async (req, res) => {
  return res.status(200).json({
    success: true,
    config: {
      fraisLivraison: FRAIS_LIVRAISON,
      seuilLivraisonGratuite: SEUIL_LIVRAISON_GRATUITE,
      seuilReduction: SEUIL_REDUCTION,
      tauxReduction: TAUX_REDUCTION,
      monnaie: 'FCFA',
      whatsappNum: '22872656485',
    },
  });
};

export { getConfig };
