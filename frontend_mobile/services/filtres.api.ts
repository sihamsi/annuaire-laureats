// services/filtres.api.ts
// Services pour récupérer les filtres (alignés avec le web)
import { apiGet } from "./api";

export interface FiltresData {
  filieres?: string[];
  provinces?: string[];
  promotions?: string[];
  secteurs?: string[];
}

// ✅ Récupérer tous les filtres (comme le web)
export async function getAllFiltres(): Promise<FiltresData> {
  try {
    return await apiGet<FiltresData>("/api/filtres/all");
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des filtres:", error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      filieres: [],
      provinces: [],
      promotions: [],
      secteurs: [],
    };
  }
}

// ✅ Récupérer les filières
export async function getFilieres(): Promise<string[]> {
  try {
    return await apiGet<string[]>("/api/filtres/filieres");
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des filières:", error);
    return [];
  }
}

// ✅ Récupérer les provinces
export async function getProvinces(): Promise<string[]> {
  try {
    return await apiGet<string[]>("/api/filtres/provinces");
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des provinces:", error);
    return [];
  }
}

// ✅ Récupérer les promotions
export async function getPromotions(): Promise<string[]> {
  try {
    return await apiGet<string[]>("/api/filtres/promotions");
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des promotions:", error);
    return [];
  }
}

// ✅ Récupérer les secteurs
export async function getSecteurs(): Promise<string[]> {
  try {
    return await apiGet<string[]>("/api/filtres/secteurs");
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des secteurs:", error);
    return [];
  }
}
