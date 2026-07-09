<template>
  <div class="panneau-filtres">

    <div class="panneau-header">
      <span class="titre">FILTRES</span>
      <div class="actions-header">
        <button class="btn-lien" @click="sauvegarderFiltre">Enregistrer</button>
        <button class="btn-lien rouge" @click="reinitialiser">Effacer</button>
      </div>
    </div>

    <!-- QUICK FILTERS -->
    <div class="quick-filtres">
      <button
        class="quick-filtre"
        :class="{ actif: filtres.priorite === 'critique' }"
        @click="toggleQuickFiltre('priorite', 'critique')"
      >
        <span class="chip-dot" style="background:#ef4444"></span>
        Priorité critique
      </button>
      <button
        class="quick-filtre"
        :class="{ actif: filtreSemaineActif }"
        @click="toggleEcheanceSemaine"
      >
        <span class="chip-dot" style="background:#3b82f6"></span>
        Échéance cette semaine
      </button>
      <button
        class="quick-filtre"
        :class="{ actif: filtres.statut === 'resolu' }"
        @click="toggleQuickFiltre('statut', 'resolu')"
      >
        <span class="chip-dot" style="background:#10b981"></span>
        Tickets terminés
      </button>
    </div>

    <div class="separateur"></div>

    <!-- DATE RANGE -->
    <div class="section">
      <span class="section-titre">Plage de dates</span>
      <div class="date-range">
        <div class="champ-date">
          <label>Début</label>
          <input type="date" v-model="filtres.date_debut" @change="emettreFiltres" />
        </div>
        <span class="fleche">→</span>
        <div class="champ-date">
          <label>Fin</label>
          <input type="date" v-model="filtres.date_fin" @change="emettreFiltres" />
        </div>
      </div>
    </div>

    <!-- TECHNICIENS -->
    <div class="section">
      <span class="section-titre">Technicien</span>
      <div v-if="techniciens.length === 0" class="no-tech">Aucun technicien</div>
      <div v-else class="avatars-grille">
        <button
          v-for="tech in techniciens"
          :key="tech.id"
          class="avatar"
          :class="{ selectionne: filtres.agents.includes(tech.id) }"
          :style="{ background: couleurUtilisateur(tech.id) }"
          :title="tech.nom"
          @click="toggleTechnicien(tech.id)"
        >
          <img v-if="tech.photo_url" :src="urlPhoto(tech.photo_url)" class="avatar-img" />
          <span v-else>{{ initiales(tech.nom) }}</span>
        </button>
      </div>
      <!-- Noms des techniciens sélectionnés -->
      <div v-if="filtres.agents.length > 0" class="agents-selectionnes">
        <span
          v-for="id in filtres.agents"
          :key="id"
          class="agent-tag"
        >
          {{ nomTechnicien(id) }}
          <button class="tag-remove" @click="toggleTechnicien(id)">×</button>
        </span>
      </div>
    </div>

    <div class="separateur"></div>

    <!-- PRIORITÉ -->
    <div class="section">
      <span class="section-titre">Priorité</span>
      <select v-model="filtres.priorite" @change="emettreFiltres">
        <option value="">Toutes priorités</option>
        <option value="critique">Critique</option>
        <option value="moyenne">Moyenne</option>
        <option value="basse">Basse</option>
      </select>
    </div>

    <!-- CLIENT -->
    <div class="section">
      <span class="section-titre">Client</span>
      <input
        type="text"
        v-model="filtres.client"
        placeholder="Rechercher un client..."
        @input="emettreFiltresDebounce"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api, { urlPhoto } from '../../services/api'
import { couleurUtilisateur, initiales } from '../../utils/avatar'

const emit = defineEmits(['filtrer'])
const techniciens = ref([])

const filtres = ref({
  priorite: '',
  agents: [],
  client: '',
  statut: '',
  date_debut: '',
  date_fin: ''
})

const filtreSemaineActif = ref(false)
let timeoutId = null

function emettreFiltres() {
  emit('filtrer', { ...filtres.value })
}

function emettreFiltresDebounce() {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => emettreFiltres(), 400)
}

function toggleTechnicien(id) {
  const index = filtres.value.agents.indexOf(id)

  if (index === -1)
    filtres.value.agents.push(id)
  else
    filtres.value.agents.splice(index, 1)

  emettreFiltres()
}

function toggleQuickFiltre(champ, valeur) {
  filtres.value[champ] = filtres.value[champ] === valeur ? '' : valeur
  emettreFiltres()
}

function toggleEcheanceSemaine() {
  filtreSemaineActif.value = !filtreSemaineActif.value
  if (filtreSemaineActif.value) {
    const auj = new Date()
    const fin = new Date()
    fin.setDate(auj.getDate() + (7 - auj.getDay()))
    filtres.value.date_debut = auj.toISOString().slice(0, 10)
    filtres.value.date_fin   = fin.toISOString().slice(0, 10)
  } else {
    filtres.value.date_debut = ''
    filtres.value.date_fin   = ''
  }
  emettreFiltres()
}

function nomTechnicien(id) {
  return techniciens.value.find(t => t.id === id)?.nom || `#${id}`
}

function sauvegarderFiltre() {
  console.log('Filtre sauvegardé', filtres.value)
}

function reinitialiser() {
  filtres.value = { priorite: '', agents: [], client: '', statut: '', date_debut: '', date_fin: '' }
  filtreSemaineActif.value = false
  emettreFiltres()
}

onMounted(async () => {
  try {
    const res = await api.get('/users?role=technicien')
    techniciens.value = res.data.data
  } catch (e) {
    console.error('Erreur chargement techniciens', e)
  }
})
</script>

<style scoped>
.panneau-filtres {
  display: flex; flex-direction: column; gap: 18px;
  padding: 16px 14px 24px; font-size: 13px; color: var(--ink);
}

.panneau-header { display: flex; align-items: center; justify-content: space-between; }
.titre { font-weight: 700; font-size: 11px; letter-spacing: 0.07em; color: var(--ink-soft); text-transform: uppercase; }
.actions-header { display: flex; gap: 10px; }
.btn-lien { background: none; border: none; font-size: 12px; cursor: pointer; padding: 0; color: var(--navy); font-weight: 500; }
.btn-lien:hover { text-decoration: underline; }
.btn-lien.rouge { color: var(--danger); }

.quick-filtres { display: flex; flex-direction: column; gap: 2px; }
.quick-filtre {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; border-radius: 8px;
  padding: 8px 8px; font-size: 13px; color: var(--ink);
  cursor: pointer; text-align: left; transition: background 0.15s;
}
.quick-filtre:hover { background: var(--bg); }
.quick-filtre.actif { background: var(--bg); font-weight: 600; border: 1px solid var(--border); }
.chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

.separateur { height: 1px; background: var(--border); }

.section { display: flex; flex-direction: column; gap: 8px; }
.section-titre { font-weight: 600; font-size: 11px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.06em; }

.section select,
.section input[type="text"] {
  padding: 8px 10px; border-radius: 8px;
  border: 1px solid var(--border); font-size: 13px;
  background: var(--surface); color: var(--ink); outline: none;
}
.section select:focus,
.section input[type="text"]:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(249,115,22,.12); }

.date-range { display: flex; align-items: flex-end; gap: 6px; }
.champ-date { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.champ-date label { font-size: 10px; color: var(--ink-soft); font-weight: 500; }
.champ-date input[type="date"] {
  padding: 7px 8px; border-radius: 8px;
  border: 1px solid var(--border); font-size: 12px;
  width: 100%; background: var(--surface); color: var(--ink); outline: none;
}
.champ-date input[type="date"]:focus { border-color: var(--accent); }
.fleche { color: var(--ink-soft); margin-bottom: 8px; font-size: 12px; }

.avatars-grille { display: flex; flex-wrap: wrap; gap: 8px; }
.avatar {
  width: 34px; height: 34px; border-radius: 50%;
  border: 2px solid transparent; color: white;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform 0.1s, border-color 0.15s; outline: none;
  overflow: hidden;
  padding: 0;
}
.avatar:hover { transform: scale(1.1); }
.avatar.selectionne { border-color: var(--navy); box-shadow: 0 0 0 2px white inset; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

/* Tags agents sélectionnés */
.agents-selectionnes { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px; }
.agent-tag {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--navy); color: white;
  font-size: 11px; font-weight: 500;
  padding: 3px 8px; border-radius: 99px;
}
.tag-remove {
  background: none; border: none; color: rgba(255,255,255,0.7);
  cursor: pointer; font-size: 13px; line-height: 1; padding: 0;
  display: flex; align-items: center;
}
.tag-remove:hover { color: white; }

.no-tech { font-size: 12px; color: var(--ink-soft); font-style: italic; }
</style>