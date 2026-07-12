// utils/helpers.ts
// Helpers pour normaliser et mapper les données (identiques au web)

/**
 * Normalise une valeur (trim + lowercase)
 */
export function normalize(v: any): string {
  return (v ?? "").toString().trim().toLowerCase();
}

/**
 * Labels des filières (identiques au web)
 */
export const FILIERE_LABELS: Record<string, string> = {
  gc: "Génie civil",
  ge: "Génie électrique",
  gi: "Génie informatique",
  glt: "Génie logistique et transports",
  ihe: "Ingénierie hydraulique et environnement",
  sig: "Sciences de l'Information Géographique (SIG / Géomatique)",
  met: "MET",
};

/**
 * Mapper une filière brute vers son label
 */
export function mapFiliere(raw: any): string {
  const key = normalize(raw);
  if (!key) return "";
  if (FILIERE_LABELS[key]) return FILIERE_LABELS[key];
  return raw.toString().trim();
}

/**
 * Normaliser un secteur
 */
export function normSecteur(raw: any): string {
  const k = normalize(raw);
  if (!k) return "";
  if (k === "public") return "public";
  if (k === "prive" || k === "privé") return "prive";
  if (k.includes("pub")) return "public";
  if (k.includes("priv")) return "prive";
  return k;
}

/**
 * Normaliser un genre
 */
export function normGenre(raw: any): string {
  const k = normalize(raw);
  if (!k) return "";
  if (["m", "h", "homme", "masculin"].includes(k)) return "m";
  if (["f", "femme", "féminin", "feminin"].includes(k)) return "f";
  return k;
}

/**
 * Couleurs par filière (identiques au web)
 */
export const FILIERE_COLORS: Record<string, string> = {
  "Génie informatique": "#6B7F5C",
  "Génie civil": "#8A9B7A",
  "Génie électrique": "#556448",
  "Sciences de l'Information Géographique (SIG / Géomatique)": "#4F6B2B",
  "Ingénierie hydraulique et environnement": "#6B7F5C",
  "Génie logistique et transports": "#8A9B7A",
};

/**
 * Obtenir la couleur d'une filière
 */
export function getColorByFiliere(filiereLabel: string): string {
  return FILIERE_COLORS[filiereLabel] || "#6B7F5C";
}

/**
 * Retirer le préfixe "Province " d'un nom de province
 */
export function formatProvinceName(province: string | null | undefined): string {
  if (!province) return "";
  return province.replace(/^Province\s+/i, '').trim();
}

/**
 * Résoudre l'URL d'une photo de lauréat
 */
export function resolvePhotoUrl(photoUrl: string | null | undefined, fallbackName?: string): string {
  // Utiliser la même URL que dans api.ts
  const { API_BASE_URL } = require("../config/network");
  
  // Si photoUrl est fourni et valide
  if (photoUrl && photoUrl.trim() !== "") {
    let resolvedUrl;
    
    // Si l'URL commence par "photos/", utiliser l'endpoint API
    if (photoUrl.startsWith("photos/")) {
      const filename = photoUrl.replace("photos/", "");
      resolvedUrl = `${API_BASE_URL}/api/laureats/photo/${filename}`;
    } else if (photoUrl.startsWith("/api/laureats/photo/")) {
      // Format déjà avec /api/laureats/photo/
      resolvedUrl = `${API_BASE_URL}${photoUrl}`;
    } else if (photoUrl.startsWith("http")) {
      resolvedUrl = photoUrl;
    } else if (photoUrl.startsWith("/")) {
      resolvedUrl = `${API_BASE_URL}${photoUrl}`;
    } else {
      resolvedUrl = `${API_BASE_URL}/${photoUrl}`;
    }
    return resolvedUrl;
  }

  // Fallback: chercher la photo par nom (format Prenom_Nom.png)
  if (fallbackName) {
    const parts = fallbackName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const prenom = parts[0].trim();
      const nom = parts[parts.length - 1].trim();
      
      // Nettoyer les noms (enlever les accents, espaces, etc.)
      const cleanPrenom = prenom
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
      const cleanNom = nom
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
      
      // Capitaliser la première lettre
      const capPrenom = cleanPrenom.length > 0 
        ? cleanPrenom.charAt(0).toUpperCase() + cleanPrenom.slice(1).toLowerCase()
        : "";
      const capNom = cleanNom.length > 0
        ? cleanNom.charAt(0).toUpperCase() + cleanNom.slice(1).toLowerCase()
        : "";
      
      if (capPrenom && capNom) {
        // Essayer d'abord .png, puis .jpg
        const filenamePng = `${capPrenom}_${capNom}.png`;
        return `${API_BASE_URL}/api/laureats/photo/${filenamePng}`;
      }
    }
  }

  // Dernier recours: avatar généré
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fallbackName || "User"
  )}`;
}