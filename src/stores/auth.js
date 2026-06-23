import { defineStore } from 'pinia';
import api from '../services/api';
import { useNotificationsStore } from './notifications';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    estConnecte: (state) => !!state.token,
    estAdmin: (state) => state.user?.role === 'admin',
    estResponsable: (state) => state.user?.role === 'responsable',
    estTechnicien: (state) => state.user?.role === 'technicien',
  },

  actions: {
    async seConnecter(email, mot_de_passe) {
      const res = await api.post('/auth/login', { email, mot_de_passe });

      const { token, role, nom, id } = res.data.data;

      this.token = token;
      this.user = { id, role, nom };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, role, nom }));

      // Connexion WebSocket
      const notifStore = useNotificationsStore();
      notifStore.connecter(id);
    },

    seDeconnecter() {
      // Déconnexion WebSocket
      const notifStore = useNotificationsStore();
      notifStore.deconnecter();

      this.token = null;
      this.user = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});