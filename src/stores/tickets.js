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
  // Chargement visible seulement si le kanban est vide (premier chargement)
  const estVide = Object.values(this.tickets).every(liste => liste.length === 0);
  if (estVide) {
    this.chargement = true;
  }
  this.erreur = null;

  try {
    const res = await api.get('/tickets', {
      params: filtres,
      paramsSerializer: (params) => {
        const parts = [];
        Object.entries(params).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach(v => {
              if (v) parts.push(`${key}[]=${encodeURIComponent(v)}`);
            });
          } else if (val !== '' && val !== null && val !== undefined) {
            parts.push(`${key}=${encodeURIComponent(val)}`);
          }
        });
        return parts.join('&');
      }
    });

    this.tickets = res.data.data;

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