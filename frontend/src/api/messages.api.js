import axios from "axios";
import { API_BASE_URL } from "./http";

// POST: utilisateur envoie un message
export const createMessage = (payload) => {
  return axios.post(`${API_BASE_URL}/api/messages`, payload);
};

// GET: admin récupère la liste
export const getMessages = () => {
  return axios.get(`${API_BASE_URL}/api/messages`);
};

// DELETE: admin supprime
export const deleteMessage = (id) => {
  return axios.delete(`${API_BASE_URL}/api/messages/${id}`);
};
