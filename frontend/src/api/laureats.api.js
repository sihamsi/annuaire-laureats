import { http } from "./http";

// Laureats
export const getLaureats = (params) => http.get("/api/laureats", { params });
// Si ton backend supporte les query params: ?filiere=&promotion=&...

export const searchLaureats = (params) =>
  http.get("/api/laureats/recherche", { params });

export const getLaureatsByStatut = (statut) =>
  http.get(`/api/laureats/statut/${statut}`);

export const getStatistiques = () => http.get("/api/laureats/statistiques");

// Filtres
export const getFilieres = () => http.get("/api/filtres/filieres");
export const getProvinces = () => http.get("/api/filtres/provinces");
export const getPromotions = () => http.get("/api/filtres/promotions");
export const getSecteurs = () => http.get("/api/filtres/secteurs");
export const getAllFiltres = () => http.get("/api/filtres/all");

// Photo (si tu as filename)
export const getPhotoUrl = (filename, baseURL) =>
  filename ? `${baseURL}/api/laureats/photo/${filename}` : null;
