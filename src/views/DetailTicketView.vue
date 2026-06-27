<template>
  <div class="page" v-if="ticket">
    <div class="detail-ticket">

      <button class="btn-retour" @click="$router.back()">← Retour</button>

      <div class="card-surface">
        <div class="entete">
          <span class="reference">{{ ticket.reference }}</span>
          <span :class="['tag', ticket.priorite]">{{ ticket.priorite }}</span>
          <span :class="['tag', ticket.statut]">{{ labelsStatut[ticket.statut] }}</span>
        </div>

        <h2>{{ ticket.titre }}</h2>
        <p class="description">{{ ticket.description || 'Aucune description fournie.' }}</p>

        <div class="infos-grid">
          <div><label>Client</label><p>{{ ticket.client_nom }}</p></div>
          <div><label>Téléphone client</label><p>{{ ticket.client_telephone || '—' }}</p></div>
          <div><label>Assigné à</label><p>{{ ticket.assigne?.nom || 'Non assigné' }}</p></div>
          <div><label>Créé par</label><p>{{ ticket.createur?.nom || 'Inconnu' }}</p></div>
          <div><label>Ouvert le</label><p>{{ formatDate(ticket.ouvert_le) }}</p></div>
        </div>
      </div>

      <!-- SLA -->
      <div v-if="sla" class="sla-bloc" :class="{ depasse: sla.depasse }">
        <h3>Indicateur SLA</h3>
        <div class="sla-infos">
          <span>Durée écoulée : {{ sla.duree_actuelle_min }} min</span>
          <span>Seuil : {{ sla.seuil_min }} min</span>
        </div>
        <div class="barre-sla">
          <div class="barre-fill" :style="{ width: sla.pourcentage + '%', background: sla.depasse ? '#dc2626' : '#16a34a' }"></div>
        </div>
        <p v-if="sla.depasse" class="sla-alerte">SLA dépassé !</p>
        <p v-else class="sla-ok">{{ sla.pourcentage }}% du seuil utilisé</p>
      </div>

      <!-- Historique -->
      <div class="card-surface timeline-block" v-if="historique.length">
        <h3>Historique des statuts</h3>
        <div class="timeline">
          <div class="timeline-item" v-for="h in historique" :key="h.id">
            <div class="circle"></div>
            <div class="content">
              <p class="statut-change">
                <span :class="['tag', h.ancien_statut]">{{ labelsStatut[h.ancien_statut] }}</span>
                →
                <span :class="['tag', h.nouveau_statut]">{{ labelsStatut[h.nouveau_statut] }}</span>
              </p>
              <p class="meta">Par <strong>{{ h.modificateur?.nom || 'Inconnu' }}</strong> · {{ formatDate(h.modifie_le) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Commentaires -->
      <div class="card-surface">
        <FilCommentaires :ticket-id="ticket.id" />
      </div>

      <!-- Upload -->
      <div class="card-surface">
        <ZoneUpload :ticket-id="ticket.id" />
      </div>

      <button class="btn-retour" @click="$router.back()">← Retour</button>
    </div>
  </div>

  <div v-else class="chargement-page">Chargement...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ticketService } from '../services/ticketService';
import api from '../services/api';
import FilCommentaires from '../components/tickets/FilCommentaires.vue';
import ZoneUpload from '../components/tickets/ZoneUpload.vue';

const route      = useRoute();
const ticket     = ref(null);
const historique = ref([]);
const sla        = ref(null);

const labelsStatut = {
  a_faire: 'À faire', en_cours: 'En cours', bloque: 'Bloqué', resolu: 'Résolu',
};

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR');
}

onMounted(async () => {
  ticket.value = await ticketService.getDetail(route.params.id);
  const resSla = await api.get(`/tickets/${route.params.id}/sla`);
  sla.value = resSla.data.data;
  const resHistorique = await api.get(`/tickets/${route.params.id}/historique`);
  historique.value = resHistorique.data.data;
});
</script>

<style scoped>
.page {
  padding: 28px 20px 60px;
  display: flex;
  justify-content: center;
  background: var(--bg);
  min-height: 100vh;
}

.detail-ticket {
  width: 100%;
  max-width: 780px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-surface {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
}

.btn-retour {
  background: none; border: none; cursor: pointer;
  color: var(--ink-soft); font-weight: 600; font-size: 13px;
  padding: 4px 0; align-self: flex-start;
}
.btn-retour:hover { color: var(--ink); }

.entete { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
.reference { font-size: 12px; color: var(--ink-soft); font-family: monospace; }

h2 { font-size: 20px; font-weight: 700; color: var(--ink); margin: 6px 0 10px; }
.description { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }

.tag { font-size: 11px; padding: 3px 8px; border-radius: 999px; font-weight: 600; text-transform: uppercase; }
.tag.a_faire  { background: #e0f2fe; color: #0284c7; }
.tag.en_cours { background: #fef9c3; color: #a16207; }
.tag.bloque   { background: #fee2e2; color: #dc2626; }
.tag.resolu   { background: #dcfce7; color: #16a34a; }
.tag.critique { background: var(--danger-soft); color: var(--danger); }
.tag.moyenne  { background: var(--warning-soft); color: #a16207; }
.tag.basse    { background: var(--success-soft); color: var(--success); }

.infos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 16px;
}
.infos-grid label { font-size: 11px; color: var(--ink-soft); display: block; margin-bottom: 2px; }
.infos-grid p { font-size: 13px; font-weight: 500; color: var(--ink); margin: 0; }

/* SLA */
.sla-bloc { background: #f0fdf4; border-radius: 12px; padding: 16px; border: 1px solid #bbf7d0; }
.sla-bloc.depasse { background: #fef2f2; border-color: #fecaca; }
.sla-bloc h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.sla-infos { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-soft); margin-bottom: 8px; flex-wrap: wrap; gap: 4px; }
.barre-sla { background: #e2e8f0; border-radius: 999px; height: 8px; }
.barre-fill { height: 8px; border-radius: 999px; transition: width 0.4s ease; }
.sla-alerte { color: #dc2626; font-size: 12px; font-weight: 600; margin-top: 6px; }
.sla-ok     { color: #16a34a; font-size: 12px; margin-top: 6px; }

/* Timeline */
.timeline-block h3 { font-size: 14px; font-weight: 600; margin-bottom: 14px; }
.timeline { display: flex; flex-direction: column; gap: 10px; }
.timeline-item { display: flex; gap: 10px; }
.circle { width: 10px; height: 10px; background: #6366f1; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
.content { background: var(--bg); padding: 10px 12px; border-radius: 8px; flex: 1; }
.statut-change { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
.meta { font-size: 12px; color: var(--ink-soft); margin: 0; }

.chargement-page { text-align: center; padding: 60px; color: var(--ink-soft); }

/* Mobile */
@media (max-width: 600px) {
  .page { padding: 16px 12px 40px; }
  .card-surface { padding: 16px; }
  h2 { font-size: 17px; }
  .infos-grid { grid-template-columns: 1fr; gap: 10px; }
  .sla-infos { flex-direction: column; }
}
</style>