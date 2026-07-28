import React from 'react';

const PolitiqueConfidentialite = () => {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen py-16 px-6 md:px-12 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Glow effet d'arrière-plan */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* En-tête */}
        <div className="border-b border-slate-800 pb-8 mb-8 text-center md:text-left">
          <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-wider">
            Politique de Confidentialité
          </h1>
          <p className="text-xs text-amber-500/80 uppercase tracking-widest mt-2 font-semibold">
            Aridona Bijoux • Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">1. Introduction</h2>
            <p>
              Bienvenue sur <strong>Aridona Bijoux</strong>. La protection de vos données personnelles est une priorité absolue. Cette politique décrit les types d'informations que nous collectons lorsque vous visitez notre plateforme, comment nous les utilisons et les mesures prises pour assurer leur sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">2. Données collectées</h2>
            <p className="mb-2">Nous collectons les données que vous nous fournissez directement lors de la création d'un compte ou de la passation d'une commande :</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Informations d'identité :</strong> Nom, prénom.</li>
              <li><strong>Coordonnées :</strong> Adresse email, numéro de téléphone / WhatsApp.</li>
              <li><strong>Adresse de livraison :</strong> Rue, code postal, ville, pays.</li>
              <li><strong>Données de connexion :</strong> Identifiants chiffrés et jetons de session (JWT).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">3. Utilisation de vos données</h2>
            <p className="mb-2">Vos informations personnelles sont uniquement utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Traiter, préparer et livrer vos commandes de bijoux.</li>
              <li>Vous contacter via WhatsApp ou téléphone en cas de besoin pour la livraison.</li>
              <li>Gérer votre espace client et l'historique de vos achats.</li>
              <li>Garantir la sécurité et l'accès à votre compte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">4. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos informations. Vos mots de passe sont hachés et chiffrés en base de données. L'accès à vos données administratives est strictement restreint via des mécanismes d'authentification sécurisés.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">5. Vos droits</h2>
            <p>
              Conformément aux réglementations sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos informations personnelles. Vous pouvez exercer ce droit à tout moment en nous contactant directement à l'adresse : <span className="text-amber-400 font-medium">contact@Aridona.com</span>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;