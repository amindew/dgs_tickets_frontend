import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
// Ajouter le token JWT à chaque requête automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function urlPhoto(chemin) {
  if (!chemin) return null;
  const base = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${base}${chemin}`;
}

export default api;