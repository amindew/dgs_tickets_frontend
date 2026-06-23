import { defineStore } from 'pinia';
import { io }          from 'socket.io-client';
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    socket:        null,
    connecte:      false,
  }),
  getters: {
    nonLues: (state) => state.notifications.filter(n => !n.lue),
    compteur:(state) => state.notifications.filter(n => !n.lue).length,
  },
  actions: {
    // Connexion au serveur WebSocket
    connecter(userId) {
      if (this.socket) return; // Deja connecte
      this.socket = io(import.meta.env.VITE_API_URL);
      this.socket.on('connect', () => {
        this.connecte = true;
        // Rejoindre la room de cet utilisateur
        this.socket.emit('rejoindre', userId);
        console.log('WebSocket connecte');
      });
      // Recevoir une notification
      this.socket.on('notification', (data) => {
        this.notifications.unshift({
          id:      Date.now(),
          lue:     false,
          ...data,
        });
      });
      this.socket.on('disconnect', () => {
        this.connecte = false;
      });
    },
    // Deconnexion propre
    deconnecter() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.connecte = false;
      }
    },
    // Marquer une notification comme lue
    marquerLue(id) {
      const n = this.notifications.find(n => n.id === id);
      if (n) n.lue = true;
    },
    // Marquer toutes comme lues
    marquerToutesLues() {
      this.notifications.forEach(n => { n.lue = true; });
    },
  }
});