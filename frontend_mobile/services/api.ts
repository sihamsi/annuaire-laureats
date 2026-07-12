// services/api.ts
// ✅ Configuration centralisée de l'API
// ⚠️ Pour changer l'adresse IP, modifier config/network.ts
import { API_BASE_URL } from "../config/network";

export { API_BASE_URL };

// Timeout pour les requêtes GET/PUT (15 secondes)
const REQUEST_TIMEOUT = 15000;
// Timeout pour les requêtes POST (création - peut prendre plus de temps)
const POST_TIMEOUT = 30000; // 30 secondes pour les créations

// Helper pour créer un timeout
function createTimeout(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout: La requête a pris trop de temps")), timeoutMs);
  });
}

// Helper générique pour GET avec timeout et meilleure gestion d'erreurs
export async function apiGet<T>(path: string): Promise<T> {
  try {
    const url = `${API_BASE_URL}${path}`;
    console.log(`🌐 GET ${url}`);
    
    const fetchPromise = fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await Promise.race([
      fetchPromise,
      createTimeout(REQUEST_TIMEOUT)
    ]);

    if (!response.ok) {
      // Ne pas logger les erreurs 404 pour les endpoints qui peuvent retourner 404 normalement
      if (response.status === 404 && path.includes('/by-device/')) {
        const text = await response.text().catch(() => "");
        throw new Error(`Erreur API 404: ${text || "Not Found"}`);
      }
      // Ne pas logger les erreurs 400 pour /statut/published (peut être vide ou erreur backend)
      if (response.status === 400 && path.includes('/statut/')) {
        const text = await response.text().catch(() => "");
        throw new Error(`Erreur API 400: ${text || "Réponse vide"}`);
      }
      const text = await response.text().catch(() => "");
      throw new Error(`Erreur API ${response.status}: ${text || "Réponse vide"}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.message.includes("Timeout")) {
      throw new Error("La connexion au serveur prend trop de temps. Vérifiez votre connexion réseau et réessayez.");
    }
    if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
      throw new Error(`Impossible de se connecter au serveur (${API_BASE_URL}). Vérifiez que le serveur est démarré et que vous êtes sur le même réseau.`);
    }
    throw error;
  }
}

// Helper générique pour POST avec timeout
export async function apiPost<T>(path: string, body: any): Promise<T> {
  try {
    const url = `${API_BASE_URL}${path}`;
    console.log(`🌐 POST ${url}`);
    
    const fetchPromise = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Utiliser un timeout plus long pour les POST (créations)
    const response = await Promise.race([
      fetchPromise,
      createTimeout(POST_TIMEOUT)
    ]);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Erreur API ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.message.includes("Timeout")) {
      throw new Error("La connexion au serveur prend trop de temps. Vérifiez votre connexion réseau et réessayez.");
    }
    if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
      throw new Error(`Impossible de se connecter au serveur (${API_BASE_URL}). Vérifiez que le serveur est démarré et que vous êtes sur le même réseau.`);
    }
    throw error;
  }
}

// Helper générique pour PUT avec timeout
export async function apiPut<T>(path: string, body: any): Promise<T> {
  try {
    const url = `${API_BASE_URL}${path}`;
    console.log(`🌐 PUT ${url}`);
    
    const fetchPromise = fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const response = await Promise.race([
      fetchPromise,
      createTimeout(REQUEST_TIMEOUT)
    ]);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Erreur API ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.message.includes("Timeout")) {
      throw new Error("La connexion au serveur prend trop de temps. Vérifiez votre connexion réseau et réessayez.");
    }
    if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
      throw new Error(`Impossible de se connecter au serveur (${API_BASE_URL}). Vérifiez que le serveur est démarré et que vous êtes sur le même réseau.`);
    }
    throw error;
  }
}

// Helper pour upload de fichier (FormData) avec timeout
export async function apiUploadFile(path: string, formData: FormData): Promise<any> {
  try {
    const url = `${API_BASE_URL}${path}`;
    console.log(`🌐 UPLOAD ${url}`);
    console.log(`📦 FormData entries:`, Array.from((formData as any)._parts || []));
    
    const fetchPromise = fetch(url, {
      method: "POST",
      body: formData,
      // ⚠️ Ne pas mettre Content-Type pour FormData (automatique)
    });

    const response = await Promise.race([
      fetchPromise,
      createTimeout(REQUEST_TIMEOUT * 2) // Plus de temps pour les uploads
    ]);

    console.log(`📥 Réponse upload - Status: ${response.status}, OK: ${response.ok}`);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`❌ Erreur upload - Status: ${response.status}, Message: ${text}`);
      throw new Error(text || `Erreur API ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Upload réussi:`, result);
    return result;
  } catch (error: any) {
    console.error(`❌ Exception upload:`, error);
    if (error.message.includes("Timeout")) {
      throw new Error("L'upload prend trop de temps. Vérifiez votre connexion réseau.");
    }
    if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
      throw new Error(`Impossible de se connecter au serveur (${API_BASE_URL}). Vérifiez que le serveur est démarré et que vous êtes sur le même réseau.`);
    }
    throw error;
  }
}
