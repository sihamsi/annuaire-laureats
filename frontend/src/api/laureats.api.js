import { http } from "./http";

// Laureats
export const getLaureats = (params) => http.get("/api/laureats", { params });
// Si ton backend supporte les query params: ?filiere=&promotion=&...

export const getLaureatById = (id) => http.get(`/api/laureats/${id}`);

export const getSimilarLaureats = (id) => http.get(`/api/laureats/${id}/similar`);

export const searchLaureats = (params) =>
  http.get("/api/laureats/recherche", { params });

export const getLaureatsByStatut = (statut) =>
  http.get(`/api/laureats/statut/${statut}`);

export const getStatistiques = () => http.get("/api/laureats/statistiques");

export const validerLaureat = (id) => http.put(`/api/laureats/${id}/valider`);

export const rejeterLaureat = (id, motif) =>
  http.put(`/api/laureats/${id}/rejeter`, { motif });

// Filtres
export const getFilieres = () => http.get("/api/filtres/filieres");
export const getProvinces = () => http.get("/api/filtres/provinces");
export const getPromotions = () => http.get("/api/filtres/promotions");
export const getSecteurs = () => http.get("/api/filtres/secteurs");
export const getAllFiltres = () => http.get("/api/filtres/all");

// Organismes
export const getOrganismes = (params) =>
  http.get("/api/organismes", { params });
export const createOrganisme = (payload) =>
  http.post("/api/organismes", payload);

// Geolocalisation
export const getGeolocalisationLaureats = (publishedOnly = false) =>
  http.get("/api/geolocalisation/laureats", { params: { publishedOnly } });

// Photo (si tu as filename)
export const getPhotoUrl = (filename, baseURL) =>
  filename ? `${baseURL}/api/laureats/photo/${filename}` : null;
