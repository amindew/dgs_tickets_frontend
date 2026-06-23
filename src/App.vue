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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { useAuthStore } from './stores/auth';

const authStore    = useAuthStore();
const route        = useRoute();
const drawerOuvert = ref(false);

// Fermer le drawer quand on change de page
watch(() => route.path, () => {
  drawerOuvert.value = false;
});
</script>