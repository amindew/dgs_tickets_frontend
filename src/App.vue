<template>
  <div>
    <NavBar
      v-if="authStore.estConnecte"
      :filtres-ouverts="drawerOuvert"
      :filtres-actifs="false"
      @toggle-filtres="drawerOuvert = !drawerOuvert"
    />
    <router-view v-slot="{ Component }">
      <component
        :is="Component"
        :drawer-ouvert="drawerOuvert"
        @update:drawer-ouvert="drawerOuvert = $event"
      />
    </router-view>

    <!-- Bouton toggle dark mode -->
    <button class="btn-dark-toggle" @click="toggleDark" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
      {{ darkMode ? '☀️' : '🌙' }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { useAuthStore } from './stores/auth';
import { useNotificationsStore } from './stores/notifications';

const authStore    = useAuthStore();
const notifStore   = useNotificationsStore();
const route        = useRoute();
const drawerOuvert = ref(false);

// --- Dark mode ---
const darkMode = ref(false);

function toggleDark() {
  darkMode.value = !darkMode.value;
  document.body.classList.toggle('dark', darkMode.value);
  localStorage.setItem('darkMode', darkMode.value ? '1' : '0');
}

// Reconnecter le WebSocket après un refresh de page
onMounted(() => {
  if (authStore.estConnecte && authStore.user?.id) {
    notifStore.connecter(authStore.user.id);
  }

  // Restaurer la préférence dark mode
  if (localStorage.getItem('darkMode') === '1') {
    darkMode.value = true;
    document.body.classList.add('dark');
  }
});

// Fermer le drawer quand on change de page
watch(() => route.path, () => {
  drawerOuvert.value = false;
});
</script>

<style scoped>
.btn-dark-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--surface);
  box-shadow: var(--shadow-md);
  font-size: 20px;
  cursor: pointer;
  z-index: 9999;
  transition: transform .2s ease, box-shadow .2s ease;
  border: 1px solid var(--border);
}

.btn-dark-toggle:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}
</style>