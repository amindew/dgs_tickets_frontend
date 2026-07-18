import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/Design-system.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.initialiser()

app.mount('#app')