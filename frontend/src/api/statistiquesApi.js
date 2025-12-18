import axiosInstance from './axiosConfig';

export const statistiquesApi = {
  // Récupérer toutes les statistiques
  getAllStatistiques: async () => {
    const response = await axiosInstance.get('/statistiques');
    return response.data;
  },

  // Récupérer le nombre total de lauréats
  getTotal: async () => {
    const response = await axiosInstance.get('/statistiques/total');
    return response.data;
  },

  // Récupérer la répartition par statut
  getByStatus: async () => {
    const response = await axiosInstance.get('/statistiques/by-status');
    return response.data;
  },

  // Récupérer la répartition par filière
  getByFiliere: async () => {
    const response = await axiosInstance.get('/statistiques/by-filiere');
    return response.data;
  },

  // Récupérer la répartition par promotion
  getByPromotion: async () => {
    const response = await axiosInstance.get('/statistiques/by-promotion');
    return response.data;
  },

  // Récupérer la répartition par secteur
  getBySecteur: async () => {
    const response = await axiosInstance.get('/statistiques/by-secteur');
    return response.data;
  },

  // Récupérer la répartition par province
  getByProvince: async () => {
    const response = await axiosInstance.get('/statistiques/by-province');
    return response.data;
  }
};

