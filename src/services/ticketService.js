import api from './api';

export const ticketService = {
  // Recuperer tous les tickets groupes par statut
  async getTous() {
    const res = await api.get('/tickets');
    return res.data.data;
  },

  // Recuperer le detail d'un ticket
  async getDetail(id) {
    const res = await api.get(`/tickets/${id}`);
    return res.data.data;
  },

  // Recuperer l'historique d'un ticket
  async getHistorique(id) {
    const res = await api.get(`/tickets/${id}/historique`);
    return res.data.data;
  },

  // Creer un ticket
  async creer(data) {
    const res = await api.post('/tickets', data);
    return res.data.data;
  },

  // Changer le statut
  async changerStatut(id, nouveau_statut) {
    const res = await api.patch(`/tickets/${id}/statut`, { nouveau_statut });
    return res.data.data;
  },

  // Assigner un technicien
  async assigner(id, assigne_id) {
    const res = await api.patch(`/tickets/${id}/assignation`, { assigne_id });
    return res.data.data;
  },
};