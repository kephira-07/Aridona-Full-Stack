import mongoose from 'mongoose';

const connectDB = async () => {
    // 1. Si déjà connecté (1) ou en cours de connexion (2), on évite de ré-attacher des listeners
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        // 2. Gestion propre des événements pour éviter les avertissements d'EventEmitter
        mongoose.connection.on('connected', () => {
            console.log(" Connexion à MongoDB Atlas réussie !");
        });

        mongoose.connection.on('error', (err) => {
            console.error(" Erreur de connexion MongoDB :", err.message);
        });

        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error(" Erreur d'initialisation MongoDB :", error.message);
        process.exit(1);
    }
};

export default connectDB;