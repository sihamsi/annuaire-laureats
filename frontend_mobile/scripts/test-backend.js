/**
 * Script pour tester la connexion au backend
 * Usage: node scripts/test-backend.js
 */

const BACKEND_IP = "172.16.248.61";
const BACKEND_PORT = "8080";
const BACKEND_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

console.log(`🔍 Test de connexion au backend...`);
console.log(`📡 URL : ${BACKEND_URL}`);
console.log("");

// Test avec fetch
fetch(`${BACKEND_URL}/api/laureats/statut/published`)
  .then(response => {
    if (response.ok) {
      console.log("✅ Backend accessible !");
      console.log(`📊 Status : ${response.status} ${response.statusText}`);
      return response.json();
    } else {
      console.log(`⚠️  Backend répond mais avec une erreur : ${response.status}`);
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log(`📈 Nombre de lauréats : ${data.length || 0}`);
  })
  .catch(error => {
    console.log("");
    console.log("❌ ERREUR : Impossible de se connecter au backend");
    console.log(`   Détails : ${error.message}`);
    console.log("");
    console.log("💡 Solutions :");
    console.log("   1. Vérifiez que le backend est démarré (mvn spring-boot:run)");
    console.log("   2. Vérifiez l'adresse IP dans config/network.ts");
    console.log("   3. Vérifiez que vous êtes sur le même réseau WiFi");
    console.log("   4. Désactivez le pare-feu Windows temporairement");
    console.log("");
    console.log(`   Commande pour trouver votre IP : ipconfig | findstr "IPv4"`);
    console.log(`   Adresse Metro Expo dans le terminal : "Metro waiting on exp://..."`);
  });

