<template>
  <div class="page">
    <div class="card card-surface">

      <div v-if="etat === 'chargement'" class="centre">
        <div class="spinner-lg"></div>
        <p>Vérification du lien...</p>
      </div>

      <div v-else-if="etat === 'formulaire'">
        <div class="entete">
          <span class="logo">DGS<span class="logo-light">STICK</span></span>
          <h2>Définir votre mot de passe</h2>
          <p class="sous-titre">Bienvenue ! Choisissez un mot de passe sécurisé pour accéder à la plateforme.</p>
        </div>

        <div v-if="erreur" class="message-erreur">{{ erreur }}</div>

        <div class="champ">
          <label>Nouveau mot de passe</label>
          <div class="champ-password">
            <input
              :type="visible ? 'text' : 'password'"
              v-model="motDePasse"
              placeholder="Min. 8 caractères"
              @input="valider"
            />
            <button class="btn-oeil" @click="visible = !visible" type="button">
              {{ visible ? '🙈' : '👁' }}
            </button>
          </div>
          <div class="force-mdp" v-if="motDePasse">
            <div class="barre-force" :class="forceClass"></div>
            <span class="force-label">{{ forceLabel }}</span>
          </div>
        </div>

        <div class="champ">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            v-model="confirmation"
            placeholder="Retapez votre mot de passe"
            :class="{ 'input-erreur': confirmation && motDePasse !== confirmation }"
          />
          <span v-if="confirmation && motDePasse !== confirmation" class="hint-erreur">
            Les mots de passe ne correspondent pas
          </span>
        </div>

        <button
          class="btn-primary btn"
          @click="soumettre"
          :disabled="!pret || envoi"
        >
          {{ envoi ? 'Enregistrement...' : 'Définir mon mot de passe' }}
        </button>
      </div>

      <div v-else-if="etat === 'succes'" class="centre">
        <div class="icone-succes">✓</div>
        <h3>Mot de passe défini !</h3>
        <p>Vous pouvez maintenant vous connecter à DGS Tickets.</p>
        <router-link to="/login" class="btn-primary btn">Se connecter</router-link>
      </div>

      <div v-else-if="etat === 'invalide'" class="centre">
        <div class="icone-erreur">✕</div>
        <h3>Lien invalide ou expiré</h3>
        <p>Ce lien de définition de mot de passe n'est plus valide. Contactez votre administrateur.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route      = useRoute();
const token      = route.params.token;
const etat       = ref('chargement');
const motDePasse = ref('');
const confirmation = ref('');
const erreur     = ref('');
const envoi      = ref(false);
const visible    = ref(false);

// Valider le token au chargement
onMounted(async () => {
  // On passe directement au formulaire — la validation se fait à la soumission
  etat.value = 'formulaire';
});

function valider() {
  erreur.value = '';
}

// Force du mot de passe
const force = computed(() => {
  const mdp = motDePasse.value;
  if (!mdp) return 0;
  let score = 0;
  if (mdp.length >= 8)  score++;
  if (mdp.length >= 12) score++;
  if (/[A-Z]/.test(mdp)) score++;
  if (/[0-9]/.test(mdp)) score++;
  if (/[^A-Za-z0-9]/.test(mdp)) score++;
  return score;
});

const forceClass = computed(() => {
  if (force.value <= 1) return 'faible';
  if (force.value <= 3) return 'moyen';
  return 'fort';
});

const forceLabel = computed(() => {
  if (force.value <= 1) return 'Faible';
  if (force.value <= 3) return 'Moyen';
  return 'Fort';
});

const pret = computed(() =>
  motDePasse.value.length >= 8 &&
  motDePasse.value === confirmation.value
);

async function soumettre() {
  erreur.value = '';
  if (!pret.value) return;

  envoi.value = true;
  try {
    await api.post(`/auth/definir-mot-de-passe/${token}`, {
      mot_de_passe: motDePasse.value
    });
    etat.value = 'succes';
  } catch (e) {
    if (e.response?.status === 404) {
      etat.value = 'invalide';
    } else {
      erreur.value = e.response?.data?.message || 'Erreur lors de la définition du mot de passe';
    }
  } finally {
    envoi.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 20px;
}

.card {
  width: 100%;
  max-width: 420px;
  padding: 36px 32px;
}

.entete { margin-bottom: 24px; }

.logo { font-weight: 700; font-size: 18px; color: var(--navy); }
.logo-light { color: #94a3b8; font-weight: 500; }

.entete h2 { font-size: 22px; font-weight: 700; margin: 12px 0 6px; color: var(--ink); }
.sous-titre { font-size: 13px; color: var(--ink-soft); }

.champ-password { position: relative; }
.champ-password input { padding-right: 40px; width: 100%; }
.btn-oeil {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 16px;
}

/* Force mot de passe */
.force-mdp { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.barre-force { height: 4px; border-radius: 99px; flex: 1; transition: all 0.3s; }
.barre-force.faible { background: var(--danger); width: 33%; }
.barre-force.moyen  { background: var(--warning); }
.barre-force.fort   { background: var(--success); }
.force-label { font-size: 11px; color: var(--ink-soft); }

.input-erreur { border-color: var(--danger) !important; }
.hint-erreur { font-size: 11px; color: var(--danger); display: block; margin-top: 4px; }

.btn-primary {
  width: 100%; padding: 12px;
  background: var(--accent); color: white; border: none;
  border-radius: 10px; font-size: 14px; font-weight: 600;
  cursor: pointer; margin-top: 8px; display: block; text-align: center;
  text-decoration: none;
}
.btn-primary:hover:not(:disabled) { background: #ea580c; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* États */
.centre { text-align: center; padding: 20px 0; }
.spinner-lg {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--border); border-top-color: var(--accent);
  animation: spin 0.8s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.icone-succes {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--success-soft); color: var(--success);
  font-size: 28px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.icone-erreur {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--danger-soft); color: var(--danger);
  font-size: 28px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.centre h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.centre p  { font-size: 13px; color: var(--ink-soft); margin-bottom: 20px; }

@media (max-width: 480px) {
  .card { padding: 24px 16px; }
}
</style>