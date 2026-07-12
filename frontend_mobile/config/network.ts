/**
 * Configuration réseau pour le frontend mobile
 * 
 * ⚠️ IMPORTANT : Cette configuration détecte automatiquement l'environnement
 * 
 * Types de connexion :
 * - Émulateur Android : utilisez "10.0.2.2"
 * - Téléphone physique (WiFi) : utilisez l'IP du réseau WiFi (détection automatique)
 * - Téléphone physique (USB) : utilisez l'IP du hotspot USB
 * - Web (même PC) : utilise "localhost" automatiquement
 * 
 * Pour trouver votre IP réseau manuellement :
 * - Windows : ipconfig (cherchez "IPv4 Address" sous votre adaptateur WiFi)
 * - Mac/Linux : ifconfig (cherchez "inet" sous votre adaptateur WiFi)
 */

// Détection de l'environnement
const isWeb = typeof window !== 'undefined' && !window.navigator.product?.includes('ReactNative');
const isAndroidEmulator = !isWeb && typeof navigator !== 'undefined' && navigator.product?.includes('ReactNative');

// 🔧 CONFIGURATION - IP du backend
// Option 1: Détection automatique (recommandé pour développement)
// L'IP sera détectée automatiquement selon la plateforme

// Option 2: IP manuelle (si la détection automatique ne fonctionne pas)
// Décommentez la ligne suivante et remplacez par votre IP locale :
// const MANUAL_BACKEND_IP = "192.168.1.100"; // ← Remplacez par votre IP

let BACKEND_IP: string;

// IP réseau réelle (fonctionne pour émulateur et téléphone physique)
// Modifiez cette IP selon votre configuration réseau
const NETWORK_IP = "192.168.1.45"; // ← Votre IP réseau principale

if (isWeb) {
  // Web : utilise localhost
  BACKEND_IP = "localhost";
} else {
  // Pour émulateur Android/iOS ET téléphone physique : utilise l'IP réseau
  // ⚠️ IMPORTANT : Remplacez NETWORK_IP ci-dessus par votre IP réseau réelle
  // Pour trouver votre IP :
  // - Windows : ipconfig (cherchez "IPv4 Address" sous votre adaptateur WiFi)
  // - Mac/Linux : ifconfig (cherchez "inet" sous votre adaptateur WiFi)
  // 
  // Note : 10.0.2.2 ne fonctionne pas toujours, utiliser l'IP réseau est plus fiable
  BACKEND_IP = NETWORK_IP;
  
  // Alternative : Décommentez pour utiliser une variable d'environnement
  // BACKEND_IP = process.env.EXPO_PUBLIC_BACKEND_IP || NETWORK_IP;
  
  // Si vous voulez essayer 10.0.2.2 d'abord pour Android (peut ne pas fonctionner)
  // BACKEND_IP = isAndroidEmulator ? "10.0.2.2" : NETWORK_IP;
}

const BACKEND_PORT = "8080";

// ✅ URL complète du backend
export const API_BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

// Pour debug (affiche l'URL utilisée)
console.log(`📡 Configuration réseau:`);
console.log(`   - Environnement: ${isWeb ? 'Web' : isAndroidEmulator ? 'Android Emulator' : 'Mobile (Physique)'}`);
console.log(`   - Backend IP: ${BACKEND_IP}`);
console.log(`   - Backend URL: ${API_BASE_URL}`);

// Export des constantes pour utilisation dans d'autres fichiers
export { BACKEND_IP, BACKEND_PORT };

/**
 * Fonction helper pour tester la connexion au backend
 * @returns Promise<boolean> - true si la connexion réussit
 */
export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/organismes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Test de connexion échoué:', error);
    return false;
  }
}