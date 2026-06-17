<template>
  <div class="login-container">
    <div class="login-card">
      <h1>DGS Tickets</h1>
      <p>Connectez-vous à votre compte</p>

      <div v-if="erreur" class="erreur">
        {{ erreur }}
      </div>

      <div class="champ">
        <label>Email</label>
        <input
          type="email"
          v-model="email"
          placeholder="admin@dgs.sn"
        />
      </div>

      <div class="champ">
        <label>Mot de passe</label>
        <input
          type="password"
          v-model="motDePasse"
        />
      </div>

      <button @click="seConnecter" :disabled="chargement">
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

    // Redirection selon le rôle
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
  }
 </style>