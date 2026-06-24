<template>
  <div class="dashboard">
    <h1>Tableau de bord</h1>

    <div v-if="chargement" class="chargement">
      Chargement...
    </div>

    <div v-else>
      <div class="kpi-grille">
        <div class="kpi-carte bleu">
          <span class="kpi-valeur">{{ kpi.tickets_ouverts }}</span>
          <span class="kpi-label">Tickets ouverts</span>
        </div>

        <div class="kpi-carte vert">
          <span class="kpi-valeur">{{ kpi.tickets_resolus }}</span>
          <span class="kpi-label">Tickets resolus</span>
        </div>

        <div class="kpi-carte orange">
          <span class="kpi-valeur">
            {{ formaterDuree(kpi.temps_moyen_resolution_min) }}
          </span>
          <span class="kpi-label">Temps moyen resolution</span>
        </div>

        <div class="kpi-carte rouge">
          <span class="kpi-valeur">{{ kpi.critiques_non_assignes }}</span>
          <span class="kpi-label">Critiques non assignes</span>
        </div>

        <div class="kpi-carte violet">
          <span class="kpi-valeur">{{ kpi.tickets_bloques }}</span>
          <span class="kpi-label">Tickets bloques</span>
        </div>

        <div class="kpi-carte gris">
          <span class="kpi-valeur">{{ kpi.taux_resolution_pct }}%</span>
          <span class="kpi-label">Taux de resolution</span>
        </div>
      </div>

      <div class="graphiques">
        <div class="graphique-bloc">
          <h3>Repartition par priorite</h3>

          <div class="barres">
            <div
              v-for="item in kpi.par_priorite"
              :key="item.priorite"
              class="barre-item"
            >
              <div class="barre-label">
                {{ item.priorite }}
              </div>

              <div class="barre-piste">
                <div
                  class="barre-fill"
                  :class="item.priorite"
                  :style="{ width: largeurBarre(item.total) + '%' }"
                ></div>
              </div>

              <div class="barre-val">
                {{ item.total }}
              </div>
            </div>
          </div>
        </div>

        <div class="graphique-bloc">
          <h3>Repartition par statut</h3>

          <div class="barres">
            <div
              v-for="item in kpi.par_statut"
              :key="item.statut"
              class="barre-item"
            >
              <div class="barre-label">
                {{ labelsStatut[item.statut] || item.statut }}
              </div>

              <div class="barre-piste">
                <div
                  class="barre-fill"
                  :class="item.statut"
                  :style="{ width: largeurBarre(item.total) + '%' }"
                ></div>
              </div>

              <div class="barre-val">
                {{ item.total }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const kpi = ref(null);
const chargement = ref(true);

const labelsStatut = {
  a_faire: 'A faire',
  en_cours: 'En cours',
  bloque: 'Bloque',
  resolu: 'Resolu'
};

// Convertir minutes en format lisible
function formaterDuree(minutes) {
  if (!minutes) return '0 min';

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Calculer la largeur d'une barre en %
function largeurBarre(valeur) {
  if (!kpi.value) return 0;

  const max = Math.max(
    ...(kpi.value.par_priorite || []).map(i => Number(i.total)),
    ...(kpi.value.par_statut || []).map(i => Number(i.total)),
    1
  );

  return Math.round((Number(valeur) / max) * 100);
}

onMounted(async () => {
  try {
    const res = await api.get('/stats/kpi');
    kpi.value = res.data.data;
  } catch (e) {
    console.error('Erreur KPI :', e);
  } finally {
    chargement.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard h1 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}

.chargement {
  text-align: center;
  padding: 40px;
}

.kpi-grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.kpi-carte {
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-carte.bleu {
  background: #dbeafe;
}

.kpi-carte.vert {
  background: #dcfce7;
}

.kpi-carte.orange {
  background: #ffedd5;
}

.kpi-carte.rouge {
  background: #fee2e2;
}

.kpi-carte.violet {
  background: #ede9fe;
}

.kpi-carte.gris {
  background: #f1f5f9;
}

.kpi-valeur {
  font-size: 32px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1;
}

.kpi-label {
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 500;
}

.graphiques {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.graphique-bloc {
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}

.graphique-bloc h3 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
}

.barres {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.barre-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.barre-label {
  font-size: 11px;
  color: var(--ink-soft);
  width: 60px;
  text-align: right;
}

.barre-piste {
  flex: 1;
  background: var(--bg);
  border-radius: 999px;
  height: 10px;
}

.barre-fill {
  height: 10px;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.barre-fill.critique {
  background: #dc2626;
}

.barre-fill.moyenne {
  background: #f97316;
}

.barre-fill.basse {
  background: #16a34a;
}

.barre-fill.a_faire {
  background: #94a3b8;
}

.barre-fill.en_cours {
  background: #3b7dd8;
}

.barre-fill.bloque {
  background: #f97316;
}

.barre-fill.resolu {
  background: #10b981;
}

.barre-val {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
  width: 20px;
}
</style>