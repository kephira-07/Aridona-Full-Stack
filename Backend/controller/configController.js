import { FRAIS_LIVRAISON } from '../config/siteConfig.js';

// Réglages publics lus par le client au démarrage (ShopContext), pour ne plus dupliquer
// des constantes comme les frais de livraison entre le backend et le frontend.
const getConfig = async (req, res) => {
  return res.status(200).json({
    success: true,
    config: {
      fraisLivraison: FRAIS_LIVRAISON,
      monnaie: 'FCFA',
      whatsappNum: '22872656485',
    },
  });
};

export { getConfig };
