import validator from 'validator';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DESTINATAIRE = 'aridonabijoux@gmail.com';

// Envoie un message du formulaire de contact public (Contact.jsx / Apropos.jsx) par email,
// avec reply_to sur l'adresse du visiteur pour répondre directement depuis la boîte mail.
const envoyerMessageContact = async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

    if (!nom || !email || !message) {
      return res.status(400).json({ success: false, message: "Nom, email et message sont obligatoires." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Adresse email invalide." });
    }

    const escapeHtml = (str) => String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const { error } = await resend.emails.send({
      from: 'Site Aridona <contact@aridona.store>',
      to: [DESTINATAIRE],
      reply_to: email,
      subject: `[Contact site] ${sujet?.trim() || 'Nouveau message'}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #1c1a17;">
          <h2 style="font-size: 18px; margin-bottom: 20px;">Nouveau message depuis le site Aridona</h2>
          <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
          <p><strong>Email :</strong> ${escapeHtml(email)}</p>
          ${sujet ? `<p><strong>Sujet :</strong> ${escapeHtml(sujet)}</p>` : ''}
          <p><strong>Message :</strong></p>
          <p style="white-space: pre-wrap; background: #faf9f6; padding: 15px; border-radius: 8px;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur Resend (contact):", error);
      return res.status(500).json({ success: false, message: "Échec de l'envoi du message." });
    }

    return res.status(200).json({ success: true, message: "Votre message a été envoyé avec succès." });
  } catch (error) {
    console.error("Erreur envoi message contact:", error);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

export { envoyerMessageContact };
