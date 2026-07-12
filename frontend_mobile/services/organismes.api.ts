// services/organismes.api.ts
// Services pour récupérer les organismes (alignés avec le web)
import { apiGet } from "./api";

export interface Organisme {
  id: number;
  nom: string;
  secteur?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  provinceId?: number;
}

// ✅ Récupérer tous les organismes (comme le web)
export async function getOrganismes(params?: any): Promise<Organisme[]> {
  try {
    return await apiGet<Organisme[]>("/api/organismes", params);
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des organismes:", error);
    return [];
  }
}

// ✅ Récupérer un organisme par ID
export async function getOrganismeById(id: number): Promise<Organisme | null> {
  try {
    return await apiGet<Organisme>(`/api/organismes/${id}`);
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération de l'organisme:", error);
    return null;
  }
}
