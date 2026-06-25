import { defineStore } from 'pinia';
import { io } from 'socket.io-client';

const CLE_STORAGE = 'dgs_notifications';

function chargerDepuisStorage() {
  try {
    return JSON.parse(localStorage.getItem(CLE_STORAGE) || '[]');
  } catch {
    return [];
  }
}

function sauvegarderDansStorage(notifications) {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(notifications));
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: chargerDepuisStorage(),
    socket: null,
    connecte: false,
  }),

  getters: {
    nonLues: (state) => state.notifications.filter(n => !n.lue),
    compteur: (state) => state.notifications.filter(n => !n.lue).length,
  },

  actions: {
    connecter(userId) {
      if (this.socket) return;

      this.socket = io(import.meta.env.VITE_API_URL);

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connecté');
        this.connecte = true;
        this.socket.emit('rejoindre', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket déconnecté');
        this.connecte = false;
      });

      // 🔔 Notification de changement de statut
      this.socket.on('notification', (data) => {
        console.log('📩 Notification reçue :', data);
        this.notifications.unshift({
          id: Date.now(),
          lue: false,
          ...data,
        });
        sauvegarderDansStorage(this.notifications);
      });

      // 🔄 Rafraîchir le kanban en temps réel
      this.socket.on('ticket_mis_a_jour', (data) => {
        console.log('🔄 Ticket mis à jour', data);
        window.dispatchEvent(new Event('refreshTickets'));
      });

      // 💬 Rafraîchir les commentaires en temps réel
      this.socket.on('commentaire_ajoute', (data) => {
        console.log('💬 Nouveau commentaire', data);
        // Dispatcher avec le détail pour que FilCommentaires puisse l'ajouter directement
        window.dispatchEvent(new CustomEvent('nouveauCommentaire', { detail: data }));
      });

      // 📎 Rafraîchir les pièces jointes en temps réel
      this.socket.on('piece_jointe_ajoutee', (data) => {
        console.log('📎 Nouvelle pièce jointe', data);
        window.dispatchEvent(new Event('refreshPieces'));
      });
    },

    deconnecter() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.connecte = false;
      }
    },

    marquerLue(id) {
      const n = this.notifications.find(n => n.id === id);
      if (n) {
        n.lue = true;
        sauvegarderDansStorage(this.notifications);
      }
    },

    marquerToutesLues() {
      this.notifications.forEach(n => { n.lue = true; });
      sauvegarderDansStorage(this.notifications);
    },

    viderNotifications() {
      this.notifications = [];
      localStorage.removeItem(CLE_STORAGE);
    },
  },
});