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
      params: filtres
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
      await api.patch(`/tickets/${id}/statut`, {
        nouveau_statut
      });

      await this.chargerTickets();
    },

    async assignerTicket(id, assigne_id) {
      await api.patch(`/tickets/${id}/assignation`, {
        assigne_id
      });

      await this.chargerTickets();
    }
  }
});