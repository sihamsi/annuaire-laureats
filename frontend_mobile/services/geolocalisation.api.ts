// services/geolocalisation.api.ts
// Services pour la géolocalisation (alignés avec le web)
import { apiGet, apiPost } from "./api";

export interface GeolocalisationLaureat {
  id: number;
  nom: string;
  prenom: string;
  filiere?: string;
  promotion?: string;
  latitude: number;
  longitude: number;
  province?: string;
  secteur?: string;
  genre?: string;
  organisme?: string;
  organisme_nom?: string;
  organisme_id?: number;
  autre_organisme?: string;
  email?: string;
  telephone?: string;
  photoUrl?: string;
}

export interface ProvinceResponse {
  latitude: string;
  longitude: string;
  province: string;
  message: string;
}

/**
 * Récupérer les lauréats avec géolocalisation (comme le web)
 * @param publishedOnly - Si true, retourne uniquement les lauréats publiés
 */
export async function getGeolocalisationLaureats(
  publishedOnly: boolean = false
): Promise<GeolocalisationLaureat[]> {
  try {
    const params = publishedOnly ? { publishedOnly: "true" } : {};
    const queryString = new URLSearchParams(params as any).toString();
    const url = `/api/geolocalisation/laureats${queryString ? `?${queryString}` : ""}`;
    return await apiGet<GeolocalisationLaureat[]>(url);
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération de la géolocalisation:", error);
    return [];
  }
}

/**
 * Identifier la province à partir de coordonnées (reverse geocoding)
 * @param latitude - Latitude du point
 * @param longitude - Longitude du point
 * @returns ProvinceResponse avec la province identifiée
 */
export async function getProvinceFromCoordinates(
  latitude: number,
  longitude: number
): Promise<ProvinceResponse> {
  try {
    const response = await apiPost<ProvinceResponse>("/api/geolocalisation/province", {
      latitude,
      longitude,
    });
    return response;
  } catch (error: any) {
    console.error("❌ Erreur lors de l'identification de la province:", error);
    throw error;
  }
}
