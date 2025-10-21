
// MOK - Seed de la base de données MongoDB avec des utilisateurs exemples

const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/universite';

async function seed() {
  try {
    await mongoose.connect(MONGO);
    console.log('✅ Connected to Mongo');

    // Schema local (simple)
    const utilisateurSchema = new Schema(
      {
        id: { type: String }, // valeur fournie par le seed
        firstName: String,
        lastName: String,
        studentId: String,
        email: String,
        age: Number,
        avatar: String,
      },
      { timestamps: true }
    );

    const Utilisateur = mongoose.models.Utilisateur || mongoose.model('Utilisateur', utilisateurSchema);

    await Utilisateur.deleteMany({});
    console.log('✅ Ancienne collection vidée.');

    const users = [
      {
        id: 'U-001',
        firstName: 'Karim',
        lastName: 'Feki',
        studentId: 'ESPRIT001',
        email: 'karim@example.tn',
        age: 23,
      },
      {
        id: 'U-002',
        firstName: 'Nesrine',
        lastName: 'Derouiche',
        studentId: 'ESPRIT002',
        email: 'nesrine@example.tn',
        age: 22,
      },
      {
        id: 'U-003',
        firstName: 'Mohamed',
        lastName: 'Abidi',
        studentId: 'ESPRIT003',
        email: 'mohamed@example.tn',
        age: 24,
      },
    ];

    await Utilisateur.insertMany(users, { ordered: true }); // ordered true par défaut
    console.log('✅ 3 utilisateurs insérés avec succès.');

    const count = await Utilisateur.countDocuments();
    console.log(`📦 Total documents: ${count}`);
  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
