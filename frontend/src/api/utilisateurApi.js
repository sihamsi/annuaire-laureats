import axiosInstance from './axiosConfig';

export const utilisateurApi = {
  // Récupérer tous les utilisateurs
  getAllUtilisateurs: async () => {
    const response = await axiosInstance.get('/utilisateurs');
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getUtilisateurById: async (id) => {
    const response = await axiosInstance.get(`/utilisateurs/${id}`);
    return response.data;
  },

  // Créer un nouvel utilisateur
  createUtilisateur: async (utilisateurData) => {
    const response = await axiosInstance.post('/utilisateurs', utilisateurData);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUtilisateur: async (id) => {
    const response = await axiosInstance.delete(`/utilisateurs/${id}`);
    return response.data;
  },

  // Récupérer les utilisateurs par rôle
  getUtilisateursByRole: async (role) => {
    const response = await axiosInstance.get(`/utilisateurs/role/${role}`);
    return response.data;
  }
};

