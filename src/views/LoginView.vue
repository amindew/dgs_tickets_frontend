<template>
  <div class="login-container">
    <div class="login-card card-surface">
      <div class="login-brand">
        <span class="pulse" aria-hidden="true"></span>
        <span class="login-logo">DGS<span>STICKS</span></span>
      </div>
      <p class="login-sub">Connectez-vous à votre compte</p>

      <div v-if="erreur" class="message-erreur">{{ erreur }}</div>

      <div class="champ">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="admin@dgs.sn" />
      </div>

      <div class="champ">
        <label>Mot de passe</label>
        <input type="password" v-model="motDePasse" placeholder="••••••••" />
      </div>

      <button class="btn btn-primary btn-block" @click="seConnecter" :disabled="chargement">
        {{ chargement ? 'Connexion...' : 'Se connecter' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const motDePasse = ref('');
const erreur = ref('');
const chargement = ref(false);

async function seConnecter() {
  chargement.value = true;
  erreur.value = '';

  try {
    await authStore.seConnecter(
      email.value,
      motDePasse.value
    );

    router.push('/kanban');
  } catch (e) {
    erreur.value = 'Email ou mot de passe incorrect';
  } finally {
    chargement.value = false;
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--navy);
  background-image: radial-gradient(circle at 20% 20%, #2c3a57 0%, var(--navy) 55%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 36px 32px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 6px;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.6);
  animation: pulse 2.2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.55); }
  70% { box-shadow: 0 0 0 7px rgba(255, 107, 53, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
}

.login-logo {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 700;
  color: var(--ink);
}

.login-logo span {
  color: var(--ink-soft);
  font-weight: 500;
  margin-left: 3px;
}

.login-sub {
  font-size: 13.5px;
  color: var(--ink-soft);
  margin: 0 0 24px;
}

.btn-block {
  width: 100%;
  margin-top: 4px;
}
</style>