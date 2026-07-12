// services/laureats.api.ts
import { API_BASE_URL, apiGet, apiPost, apiPut, apiUploadFile } from "./api";
import { normalize, mapFiliere, normSecteur, normGenre } from "../utils/helpers";

type Params = {
  nom?: string;
  prenom?: string;
  filiere?: string;
  promotion?: string;
  organisme?: string;
  genre?: string;
  secteur?: string;
  province?: string;
  page?: number;
  size?: number;
};

type LaureatPayload = {
  nom: string;
  prenom: string;
  genre: string;
  telephone?: string;
  email: string;
  password?: string; // Mot de passe pour l'inscription
  promotion: string;
  filiere?: string;
  filiereId?: number | null;
  secteur?: string;
  organisme: string;
  autreOrganisme?: string | null;
  latitude: number;
  longitude: number;
  description?: string;
  photoUri?: string | null;
  deviceId: string;
  // dateInscription est automatique côté backend, pas besoin de l'envoyer
};

function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    q.append(key, String(value));
  });

  return q.toString();
}

// ✅ Créer une inscription
export async function createLaureat(payload: LaureatPayload) {
  return apiPost("/api/laureats", payload);
}

// ✅ Upload photo pour un lauréat
export async function uploadLaureatPhoto(laureatId: number, photoUri: string) {
  console.log("📤 === PRÉPARATION UPLOAD PHOTO ===");
  console.log("📤 LaureatId:", laureatId);
  console.log("📤 PhotoUri:", photoUri);
  console.log("📤 PhotoUri type:", typeof photoUri);
  
  if (!photoUri || photoUri.trim() === "") {
    throw new Error("Photo URI est vide ou invalide");
  }
  
  if (!laureatId || laureatId <= 0) {
    throw new Error("ID lauréat invalide");
  }
  
  const formData = new FormData();
  
  // Pour React Native, FormData nécessite un objet avec uri, type, name
  // Détecter l'extension du fichier depuis l'URI
  let extension = ".jpg";
  if (photoUri.toLowerCase().endsWith(".png")) {
    extension = ".png";
  } else if (photoUri.toLowerCase().endsWith(".jpeg")) {
    extension = ".jpeg";
  }
  
  const fileName = `photo_${laureatId}${extension}`;
  const mimeType = extension === ".png" ? "image/png" : "image/jpeg";
  
  console.log("📤 Nom fichier:", fileName);
  console.log("📤 Type MIME:", mimeType);
  
  formData.append("file", {
    uri: photoUri,
    name: fileName,
    type: mimeType,
  } as any);

  console.log("📤 FormData préparé, envoi de la requête d'upload...");
  console.log("📤 URL:", `/api/laureats/${laureatId}/photo`);
  
  try {
    const result = await apiUploadFile(`/api/laureats/${laureatId}/photo`, formData);
    console.log("✅ === UPLOAD RÉUSSI ===");
    console.log("✅ Résultat complet:", JSON.stringify(result, null, 2));
    
    if (result && result.photoUrl) {
      console.log("✅ Photo URL dans la réponse:", result.photoUrl);
    } else {
      console.warn("⚠️ Photo uploadée mais photoUrl non présent dans la réponse");
    }
    
    return result;
  } catch (error: any) {
    console.error("❌ === ERREUR DANS uploadLaureatPhoto ===");
    console.error("❌ Erreur:", error);
    console.error("❌ Message:", error.message);
    throw error;
  }
}

// ✅ Récupérer les lauréats validés (publiés) avec filtres (comme le web)
export async function getValidatedLaureats(params: Params) {
  console.log("🔍 Filtres reçus dans API:", params);

  try {
    // Utiliser l'endpoint comme le web
    const allLaureats = await apiGet<any[]>("/api/laureats/statut/published");
    console.log(`📊 Total lauréats publiés: ${allLaureats?.length || 0}`);
    
    // S'assurer que c'est un tableau (comme le web)
    const laureatsArray = Array.isArray(allLaureats) ? allLaureats : [];

    // Normaliser les lauréats (comme le web)
    const normalizedLaureats = laureatsArray.map((l: any) => {
      const filiereLabel = mapFiliere(l.filiere);
      const secteurNorm = normSecteur(l.secteur);
      const genreNorm = normGenre(l.genre);
      
      return {
        ...l,
        filiereLabel,
        secteurNorm,
        genreNorm,
      };
    });

    // Appliquer les filtres côté client (comme le web)
    let filtered = normalizedLaureats;

  // Recherche globale (comme le web)
  if (params.nom || params.prenom) {
    const searchTerm = normalize(params.nom || params.prenom || "");
    if (searchTerm) {
      filtered = filtered.filter((l: any) =>
        normalize(l.nom).includes(searchTerm) ||
        normalize(l.prenom).includes(searchTerm) ||
        normalize(l.email).includes(searchTerm)
      );
      console.log(`🔎 Recherche globale: "${searchTerm}" → ${filtered.length} résultats`);
    }
  }
  
  if (params.filiere) {
    console.log(`🔎 Filtre filiere: "${params.filiere}"`);
    const f = normalize(params.filiere);
    filtered = filtered.filter((l: any) => normalize(l.filiereLabel) === f);
    console.log(`   → ${filtered.length} résultats`);
  }
  
  if (params.promotion) {
    console.log(`🔎 Filtre promotion: "${params.promotion}"`);
    filtered = filtered.filter((l: any) => l.promotion === params.promotion);
    console.log(`   → ${filtered.length} résultats`);
  }
  
  if (params.organisme) {
    console.log(`🔎 Filtre organisme: "${params.organisme}"`);
    filtered = filtered.filter((l: any) =>
      l.organisme?.toLowerCase().includes(params.organisme!.toLowerCase())
    );
    console.log(`   → ${filtered.length} résultats`);
  }
  
  if (params.genre) {
    console.log(`🔎 Filtre genre: "${params.genre}"`);
    const g = normGenre(params.genre);
    filtered = filtered.filter((l: any) => l.genreNorm === g);
    console.log(`   → ${filtered.length} résultats`);
  }
  
  if (params.secteur) {
    console.log(`🔎 Filtre secteur: "${params.secteur}"`);
    const s = normSecteur(params.secteur);
    filtered = filtered.filter((l: any) => l.secteurNorm === s);
    console.log(`   → ${filtered.length} résultats`);
  }
  
  if (params.province) {
    console.log(`🔎 Filtre province: "${params.province}"`);
    filtered = filtered.filter((l: any) => normalize(l.province) === normalize(params.province));
    console.log(`   → ${filtered.length} résultats`);
  }

  console.log(`✅ Total après filtres: ${filtered.length}`);

  // Pagination côté client
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const start = page * size;
  const end = start + size;
  const content = filtered.slice(start, end);
  const totalPages = Math.ceil(filtered.length / size) || 1;

  return { content, totalPages, totalElements: filtered.length };
  } catch (error: any) {
    // En cas d'erreur (400, 404, etc.), retourner un tableau vide silencieusement (comme le web)
    // Cela permet à l'application de continuer à fonctionner même si le backend retourne une erreur
    // Ne pas logger l'erreur pour éviter le bruit dans la console si c'est juste une base vide
    // Les erreurs 400 pour /statut/published sont normales si la base est vide ou si le backend a un problème
    if (!error.message?.includes("400") && !error.message?.includes("Erreur API 400")) {
      // Logger uniquement les erreurs non-400 pour le debugging
      console.warn("⚠️ Erreur lors de la récupération des lauréats:", error.message);
    }
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}

// ✅ Récupérer un lauréat par ID
export async function getLaureatById(id: string | number) {
  try {
    return await apiGet<any>(`/api/laureats/${id}`);
  } catch (error: any) {
    if (error.message.includes("404") || error.message.includes("Erreur API 404")) {
      return null;
    }
    throw error;
  }
}

// ✅ Récupérer un lauréat par Device ID
export async function getLaureatByDeviceId(deviceId: string) {
  try {
    return await apiGet<any>(`/api/laureats/by-device/${deviceId}`);
  } catch (error: any) {
    // 404 est normal si l'utilisateur n'est pas encore inscrit
    if (error.message.includes("404") || error.message.includes("Erreur API 404") || error.message.includes("Not Found")) {
      return null; // Pas encore inscrit - ne pas logger comme erreur
    }
    // Pour les autres erreurs, on les propage
    console.error("❌ Erreur lors de la récupération par deviceId:", error);
    throw error;
  }
}

// ✅ Mettre à jour un lauréat
export async function updateLaureat(id: number, payload: Partial<LaureatPayload>) {
  return apiPut(`/api/laureats/${id}`, payload);
}

// ✅ Récupérer les points de carte via géolocalisation (comme le web)
export async function getValidatedMapPoints() {
  try {
    // Utiliser l'endpoint de géolocalisation comme le web
    const { getGeolocalisationLaureats } = await import("./geolocalisation.api");
    const laureats = await getGeolocalisationLaureats(true); // publishedOnly = true
  
    // Filtrer uniquement ceux qui ont des coordonnées valides
    return laureats.filter((l: any) => 
      l.latitude != null && 
      l.longitude != null && 
      !isNaN(Number(l.latitude)) && 
      !isNaN(Number(l.longitude))
    );
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des points de carte:", error);
    throw error;
  }
}

// ✅ Récupérer tous les lauréats (comme le web)
export async function getLaureats(params?: any) {
  try {
    return await apiGet<any>("/api/laureats", params);
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des lauréats:", error);
    throw error;
  }
}

// ✅ Récupérer les lauréats par statut (comme le web)
export async function getLaureatsByStatut(statut: string) {
  try {
    return await apiGet<any[]>(`/api/laureats/statut/${statut}`);
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des lauréats par statut:", error);
    throw error;
  }
}
