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

      const { token, role, nom, id, photo_url } = res.data.data;

      this.token = token;
      this.user = { id, role, nom, photo_url };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, role, nom, photo_url }));

      const notifStore = useNotificationsStore();
      notifStore.connecter(id);
    },

    mettreAJourPhoto(photo_url) {
      this.user = { ...this.user, photo_url };
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    seDeconnecter() {
      const notifStore = useNotificationsStore();
      notifStore.deconnecter();

      this.token = null;
      this.user = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});