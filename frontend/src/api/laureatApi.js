import axiosInstance from './axiosConfig';

export const laureatApi = {
  // Récupérer tous les lauréats avec filtres
  getAllLaureats: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/laureats?${params.toString()}`);
    return response.data;
  },

  // Récupérer un lauréat par ID
  getLaureatById: async (id) => {
    const response = await axiosInstance.get(`/laureats/${id}`);
    return response.data;
  },

  // Créer un nouveau lauréat (inscription)
  createLaureat: async (laureatData) => {
    const response = await axiosInstance.post('/laureats', laureatData);
    return response.data;
  },

  // Récupérer les inscriptions en attente
  getPendingInscriptions: async () => {
    const response = await axiosInstance.get('/laureats/pending');
    return response.data;
  },

  // Récupérer les inscriptions rejetées
  getRejectedInscriptions: async () => {
    const response = await axiosInstance.get('/laureats/rejected');
    return response.data;
  },

  // Valider une inscription
  validateLaureat: async (id) => {
    const response = await axiosInstance.post(`/laureats/${id}/validate`);
    return response.data;
  },

  // Rejeter une inscription avec motif
  rejectLaureat: async (id, motifRejet) => {
    const response = await axiosInstance.post(`/laureats/${id}/reject`, {
      motifRejet
    });
    return response.data;
  }
};







