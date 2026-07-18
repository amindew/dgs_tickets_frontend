import { defineStore } from 'pinia';
import { io }          from 'socket.io-client';
import api             from '../services/api';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    socket:        null,
    connecte:      false,
  }),

  getters: {
    nonLues:  (state) => state.notifications.filter(n => !n.lue),
    compteur: (state) => state.notifications.filter(n => !n.lue).length,
  },

  actions: {
    // Charger les notifications depuis la base de données
    async charger() {
      try {
        const res = await api.get('/notifications');
        const depuisApi = res.data.data.map(n => ({
          ...n,
          reference: n.ticket?.reference,
          date: n.createdAt,
        }));

        // Fusionne avec ce qui est déjà là plutôt que d'écraser, pour ne pas
        // perdre une notification reçue en direct pendant que cette requête
        // était en vol
        const idsApi = new Set(depuisApi.map(n => n.id));
        const enAttente = this.notifications.filter(n => !idsApi.has(n.id));

        this.notifications = [...enAttente, ...depuisApi]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (e) {
        console.error('Erreur chargement notifications :', e);
      }
    },

    // Connexion WebSocket
    connecter(token) {
      if (this.socket) return;

      this.socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        auth: { token },
      });

      this.socket.on('connect', () => {
        this.connecte = true;
        // Charger les notifications existantes depuis la BDD
        this.charger();
      });

      // Recevoir une nouvelle notification en temps réel
      this.socket.on('notification', (data) => {
        // Le backend doit fournir l'id réel de la notif en base (colonne
        // "id" de la table Notifications) pour que marquerLue() fonctionne.
        // Si jamais il manque (ancien code backend pas encore redéployé),
        // on retombe sur un id temporaire pour ne pas planter l'affichage,
        // mais "marquer comme lue" ne pourra pas fonctionner pour cette
        // notif tant que le vrai id n'est pas là.
        const id = data.id ?? `temp-${Date.now()}`;

        // Évite les doublons si un rechargement (charger()) a déjà
        // inséré cette notif entre-temps
        if (this.notifications.some(n => n.id === id)) return;

        this.notifications.unshift({
          lue: false,
          ...data,
          id,
          date: data.date || new Date().toISOString(),
        });
      });

      // Relaye les mises à jour temps réel d'un ticket ouvert vers les
      // composants concernés (fil de commentaires, pièces jointes)
      this.socket.on('commentaire_ajoute', (data) => {
        window.dispatchEvent(new CustomEvent('nouveauCommentaire', { detail: data }));
      });

      this.socket.on('piece_jointe_ajoutee', (data) => {
        window.dispatchEvent(new CustomEvent('nouvellePieceJointe', { detail: data }));
      });

      this.socket.on('disconnect', () => {
        this.connecte = false;
      });
    },

    // Marquer une notification comme lue
    async marquerLue(id) {
      // Une notif sans vrai id backend ne peut pas être persistée en lue
      if (typeof id === 'string' && id.startsWith('temp-')) {
        const n = this.notifications.find(n => n.id === id);
        if (n) n.lue = true;
        return;
      }

      try {
        await api.patch(`/notifications/${id}/lue`);
        const n = this.notifications.find(n => n.id === id);
        if (n) n.lue = true;
      } catch (e) {
        console.error(e);
      }
    },

    // Marquer toutes comme lues
    async marquerToutesLues() {
      try {
        await api.patch('/notifications/tout-lire');
        this.notifications.forEach(n => { n.lue = true; });
      } catch (e) {
        console.error(e);
      }
    },

    // Déconnexion
    deconnecter() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket        = null;
        this.connecte      = false;
        this.notifications = [];
      }
    },
  }
});