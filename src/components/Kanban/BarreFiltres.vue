<template>
  <div class="panneau-filtres">

    <!-- HEADER -->
    <div class="panneau-header">
      <span class="titre">FILTRES</span>
      <div class="actions-header">
        <button class="btn-lien" @click="sauvegarderFiltre">Enregistrer</button>
        <button class="btn-lien" @click="reinitialiser">Effacer</button>
      </div>
    </div>

    <!-- QUICK FILTERS -->
    <div class="quick-filtres">
      <button
        class="quick-filtre"
        :class="{ actif: filtres.priorite === 'critique' }"
        @click="toggleQuickFiltre('priorite', 'critique')"
      >
        <span class="icone">⚠️</span>
        Priorité critique
      </button>

      <button
        class="quick-filtre"
        :class="{ actif: filtreSemaineActif }"
        @click="toggleEcheanceSemaine"
      >
        <span class="icone">📅</span>
        Échéance cette semaine
      </button>

      <button
        class="quick-filtre"
        :class="{ actif: filtres.statut === 'termine' }"
        @click="toggleQuickFiltre('statut', 'termine')"
      >
        <span class="icone">✔️</span>
        Tickets terminés
      </button>
    </div>

    <hr class="separateur" />

    <!-- DATE RANGE -->
    <div class="section">
      <span class="section-titre">Plage de dates</span>

      <div class="date-range">
        <div class="champ-date">
          <label>Début</label>
          <input
            type="date"
            v-model="filtres.date_debut"
            @change="emettreFiltres"
          />
        </div>

        <span class="fleche">→</span>

        <div class="champ-date">
          <label>Fin</label>
          <input
            type="date"
            v-model="filtres.date_fin"
            @change="emettreFiltres"
          />
        </div>
      </div>
    </div>

    <!-- ASSIGNEE (multi-select avatars) -->
    <div class="section">
      <span class="section-titre">Technicien</span>

      <div class="avatars-grille">
        <button
          v-for="tech in techniciens"
          :key="tech.id"
          class="avatar"
          :class="{ selectionne: filtres.agents.includes(tech.id) }"
          :style="{ background: couleurAvatar(tech) }"
          :title="tech.nom"
          @click="toggleTechnicien(tech.id)"
        >
          {{ initiales(tech.nom) }}
        </button>
      </div>
    </div>

    <hr class="separateur" />

    <!-- PRIORITÉ (select classique conservé) -->
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
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

const emit = defineEmits(['filtrer'])

const techniciens = ref([])

// Palette pour les avatars (cycle sur la liste selon l'id du technicien)
const palette = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#1e293b', '#06b6d4']

const filtres = ref({
  priorite: '',
  agents: [],       // multi-sélection des techniciens
  client: '',
  statut: '',
  date_debut: '',
  date_fin: ''
})

let timeoutId = null

function emettreFiltres() {
  emit('filtrer', { ...filtres.value })
}

function emettreFiltresDebounce() {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    emettreFiltres()
  }, 400)
}

function toggleTechnicien(id) {
  const index = filtres.value.agents.indexOf(id)
  if (index === -1) {
    filtres.value.agents.push(id)
  } else {
    filtres.value.agents.splice(index, 1)
  }
  emettreFiltres()
}

function toggleQuickFiltre(champ, valeur) {
  filtres.value[champ] = filtres.value[champ] === valeur ? '' : valeur
  emettreFiltres()
}

// Cas particulier "échéance cette semaine" : calcule un vrai range de dates
const filtreSemaineActif = ref(false)

function toggleEcheanceSemaine() {
  filtreSemaineActif.value = !filtreSemaineActif.value

  if (filtreSemaineActif.value) {
    const aujourdHui = new Date()
    const finSemaine = new Date()
    finSemaine.setDate(aujourdHui.getDate() + (7 - aujourdHui.getDay()))

    filtres.value.date_debut = aujourdHui.toISOString().slice(0, 10)
    filtres.value.date_fin = finSemaine.toISOString().slice(0, 10)
  } else {
    filtres.value.date_debut = ''
    filtres.value.date_fin = ''
  }

  emettreFiltres()
}

function initiales(nom) {
  if (!nom) return '?'
  return nom
    .split(' ')
    .map(mot => mot[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function couleurAvatar(tech) {
  return palette[tech.id % palette.length]
}

function sauvegarderFiltre() {
  // À adapter : par ex. appel API pour sauvegarder le preset de filtres
  console.log('Filtre sauvegardé', filtres.value)
}

function reinitialiser() {
  filtres.value = {
    priorite: '',
    agents: [],
    client: '',
    statut: '',
    date_debut: '',
    date_fin: ''
  }
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 280px;
  padding: 16px;
  background: white;
  border-right: 1px solid #e2e8f0;
  font-size: 13px;
}

/* HEADER */
.panneau-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.titre {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
  color: #1e293b;
}

.actions-header {
  display: flex;
  gap: 12px;
}

.btn-lien {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.btn-lien:hover {
  text-decoration: underline;
}

/* QUICK FILTRES */
.quick-filtres {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-filtre {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  border-radius: 6px;
  padding: 8px 6px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  text-align: left;
}

.quick-filtre:hover {
  background: #f1f5f9;
}

.quick-filtre.actif {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.icone {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

/* SEPARATEUR */
.separateur {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0;
}

/* SECTIONS */
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-titre {
  font-weight: 600;
  font-size: 12px;
  color: #1e293b;
}

.section select,
.section input[type="text"] {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
}

/* DATE RANGE */
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.champ-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.champ-date label {
  font-size: 11px;
  color: #64748b;
}

.champ-date input[type="date"] {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  width: 100%;
}

.fleche {
  margin-top: 16px;
  color: #94a3b8;
}

/* AVATARS */
.avatars-grille {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
}

.avatar:hover {
  transform: scale(1.08);
}

.avatar.selectionne {
  border-color: #1e293b;
  box-shadow: 0 0 0 2px white inset;
}
</style>