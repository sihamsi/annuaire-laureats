// Script pour générer un mot de passe pour un compte spécifique
// Usage: node generate_password.js <email>

const http = require('http');

const email = process.argv[2] || 'laureat@example.com';
const API_URL = 'http://localhost:8080/api/laureats/generate-password';

const postData = JSON.stringify({ email });

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/laureats/generate-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`🔄 Génération du mot de passe pour ${email}...`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('\n✅ Mot de passe généré avec succès!');
        console.log(`📧 Email: ${response.email}`);
        console.log(`🔑 Mot de passe: ${response.password}`);
        console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants.');
      } else {
        console.error('\n❌ Erreur:', response.error || data);
      }
    } catch (e) {
      console.error('\n❌ Erreur lors de la lecture de la réponse:', e.message);
      console.log('Réponse brute:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Erreur de connexion: ${e.message}`);
  console.log('\n💡 Assurez-vous que le backend est démarré sur http://localhost:8080');
});

req.write(postData);
req.end();
