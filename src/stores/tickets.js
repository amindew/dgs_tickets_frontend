import { defineStore } from 'pinia';
import api from '../services/api';

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: {
      a_faire: [],
      en_cours: [],
      bloque: [],
      resolu: []
    },
    chargement: false,
    erreur: null
  }),

  actions: {
    async chargerTickets(filtres = {}) {
      this.chargement = true;
      this.erreur = null;

      try {
        const res = await api.get('/tickets', {
          params: filtres,

          // Serialiser les tableaux correctement :
          // agents: ['uuid1', 'uuid2'] => agents[]=uuid1&agents[]=uuid2
          // Sans ca, Axios envoie agents=uuid1,uuid2 (string) que
          // Express ne peut pas lire comme un tableau
          paramsSerializer: (params) => {
            const parts = [];
            Object.entries(params).forEach(([key, val]) => {
              if (Array.isArray(val)) {
                // Tableau : envoyer chaque valeur separement
                val.forEach(v => {
                  if (v) parts.push(`${key}[]=${encodeURIComponent(v)}`);
                });
              } else if (val !== '' && val !== null && val !== undefined) {
                // Valeur simple : envoyer directement
                parts.push(`${key}=${encodeURIComponent(val)}`);
              }
              // Ignorer les valeurs vides (pas de filtre actif)
            });
            return parts.join('&');
          }
        });

        console.log('REPONSE API =', res.data);
        this.tickets = res.data.data;
        console.log('TICKETS STORE =', this.tickets);

      } catch (e) {
        console.error('ERREUR =', e);
        this.erreur = e.message;
      } finally {
        this.chargement = false;
      }
    },

    async creerTicket(data) {
      const res = await api.post('/tickets', data);
      await this.chargerTickets();
      return res.data.data;
    },

    async changerStatut(id, nouveau_statut) {
      await api.patch(`/tickets/${id}/statut`, { nouveau_statut });
      await this.chargerTickets();
    },

    async assignerTicket(id, assigne_id) {
      await api.patch(`/tickets/${id}/assignation`, { assigne_id });
      await this.chargerTickets();
    }
  }
});