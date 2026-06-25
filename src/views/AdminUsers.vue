<template>
  <div class="admin-page">
<button class="btn-retour" @click="$router.back()">← Retour</button>
    <div class="admin-header">
      <div>
        <h1 class="admin-titre">Gestion des utilisateurs</h1>
        <p class="admin-sous-titre">Créer, modifier et désactiver les comptes techniciens et responsables</p>
      </div>
      <button class="btn-primary" @click="ouvrirCreation">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        Nouvel utilisateur
      </button>
    </div>

    <div class="filtres-bar">
      <button v-for="r in rolesTab" :key="r.val" class="filtre-role" :class="{ actif: filtreRole === r.val }" @click="filtreRole = r.val">
        {{ r.label }} <span class="count">{{ compterRole(r.val) }}</span>
      </button>
    </div>

    <div class="table-wrap card-surface">
      <div v-if="chargement" class="loader">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>

      <template v-else>
        <!-- DESKTOP : tableau -->
        <table class="table desktop-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Modifier rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in utilisateursFiltres" :key="u.id" :class="{ inactif: !u.actif }">
              <td>
                <div class="user-cell">
                  <div class="avatar-md" :style="{ background: couleur(u) }">{{ initiales(u.nom) }}</div>
                  <span class="user-nom">{{ u.nom }}</span>
                </div>
              </td>
              <td class="email">{{ u.email }}</td>
              <td><span class="badge-role">{{ u.role }}</span></td>
              <td>
                <span v-if="u.id !== authStore.user?.id" class="badge-statut" :class="u.actif ? 'actif' : 'inactif-badge'">
                  {{ u.actif ? 'Actif' : 'Inactif' }}
                </span>
                <span v-else class="badge-moi">Vous</span>
              </td>
              <td>
                <button v-if="u.id !== authStore.user?.id" class="btn-icone" @click="ouvrirModifRole(u)">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                  </svg>
                </button>
                <span v-else class="tiret">—</span>
              </td>
              <td>
                <button v-if="u.id !== authStore.user?.id" class="btn-action" :class="u.actif ? 'desactiver' : 'activer'" @click="toggleActif(u)">
                  {{ u.actif ? 'Désactiver' : 'Réactiver' }}
                </button>
                <span v-else class="tiret">—</span>
              </td>
            </tr>
            <tr v-if="utilisateursFiltres.length === 0">
              <td colspan="6" class="vide-msg">Aucun utilisateur trouvé</td>
            </tr>
          </tbody>
        </table>

        <!-- MOBILE : cartes -->
        <div class="mobile-cartes">
          <div v-for="u in utilisateursFiltres" :key="u.id" class="carte-user" :class="{ inactif: !u.actif }">
            <div class="carte-top">
              <div class="user-cell">
                <div class="avatar-md" :style="{ background: couleur(u) }">{{ initiales(u.nom) }}</div>
                <div>
                  <div class="user-nom">{{ u.nom }}</div>
                  <div class="email">{{ u.email }}</div>
                </div>
              </div>
              <div class="carte-right">
                <span class="badge-role">{{ u.role }}</span>
                <span v-if="u.id !== authStore.user?.id" class="badge-statut" :class="u.actif ? 'actif' : 'inactif-badge'">
                  {{ u.actif ? 'Actif' : 'Inactif' }}
                </span>
                <span v-else class="badge-moi">Vous</span>
              </div>
            </div>
            <div v-if="u.id !== authStore.user?.id" class="carte-actions">
              <button class="btn-icone" @click="ouvrirModifRole(u)">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                </svg>
                Modifier rôle
              </button>
              <button class="btn-action" :class="u.actif ? 'desactiver' : 'activer'" @click="toggleActif(u)">
                {{ u.actif ? 'Désactiver' : 'Réactiver' }}
              </button>
            </div>
          </div>
          <div v-if="utilisateursFiltres.length === 0" class="vide-msg">Aucun utilisateur trouvé</div>
        </div>
      </template>
    </div>

    <!-- Modal création -->
    <transition name="modal">
      <div v-if="modalOuverte" class="modal-overlay" @click.self="fermerModal">
        <div class="modal card-surface">
          <div class="modal-header">
            <h2 class="modal-titre">Nouvel utilisateur</h2>
            <button class="btn-fermer" @click="fermerModal">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div v-if="erreurModal" class="message-erreur">{{ erreurModal }}</div>
          <div class="champ">
            <label>Nom complet</label>
            <input v-model="form.nom" type="text" placeholder="Ex : Amadou Diallo" />
          </div>
          <div class="champ">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="amadou@dgs.sn" :class="{ 'input-erreur': emailInvalide }" @blur="validerEmail" />
            <span v-if="emailInvalide" class="hint-erreur">Format invalide</span>
          </div>
          <div class="champ">
            <label>Mot de passe</label>
            <input v-model="form.mot_de_passe" type="password" placeholder="Min. 8 caractères, 1 chiffre, 1 majuscule" :class="{ 'input-erreur': mdpInvalide }" @blur="validerMdp" />
            <span v-if="mdpInvalide" class="hint-erreur">{{ mdpHint }}</span>
          </div>
          <div class="champ">
            <label>Rôle</label>
            <select v-model="form.role">
              <option value="technicien">Technicien</option>
              <option value="responsable">Responsable</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary btn" @click="fermerModal">Annuler</button>
            <button class="btn-primary btn" :disabled="creation" @click="creerUtilisateur">
              {{ creation ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal modification rôle -->
    <transition name="modal">
      <div v-if="modalRoleOuverte" class="modal-overlay" @click.self="fermerModalRole">
        <div class="modal card-surface modal-sm">
          <div class="modal-header">
            <h2 class="modal-titre">Modifier le rôle</h2>
            <button class="btn-fermer" @click="fermerModalRole">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <p class="modal-user-nom">{{ userEnModif?.nom }}</p>
          <div class="champ">
            <label>Nouveau rôle</label>
            <select v-model="nouveauRole">
              <option value="technicien">Technicien</option>
              <option value="responsable">Responsable</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary btn" @click="fermerModalRole">Annuler</button>
            <button class="btn-primary btn" @click="confirmerRole">Confirmer</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toast" class="toast-succes">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore    = useAuthStore()
const utilisateurs = ref([])
const chargement   = ref(false)
const filtreRole   = ref('tous')
const modalOuverte = ref(false)
const creation     = ref(false)
const erreurModal  = ref('')
const toast        = ref('')

// Modal rôle
const modalRoleOuverte = ref(false)
const userEnModif      = ref(null)
const nouveauRole      = ref('technicien')

// Validation
const emailInvalide = ref(false)
const mdpInvalide   = ref(false)
const mdpHint       = ref('')

const form = ref({ nom: '', email: '', mot_de_passe: '', role: 'technicien' })

const rolesTab = [
  { val: 'tous',        label: 'Tous' },
  { val: 'technicien',  label: 'Techniciens' },
  { val: 'responsable', label: 'Responsables' },
  { val: 'admin',       label: 'Admins' },
]

const palette = ['#3b7dd8', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#0f172a']

function initiales(nom) {
  if (!nom) return '?'
  return nom.split(' ').map(m => m[0]).join('').slice(0, 2).toUpperCase()
}
function couleur(u) { return palette[u.id % palette.length] }
function compterRole(val) {
  if (val === 'tous') return utilisateurs.value.length
  return utilisateurs.value.filter(u => u.role === val).length
}

const utilisateursFiltres = computed(() => {
  if (filtreRole.value === 'tous') return utilisateurs.value
  return utilisateurs.value.filter(u => u.role === filtreRole.value)
})

// Validation email
function validerEmail() {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailInvalide.value = form.value.email.length > 0 && !re.test(form.value.email)
}

// Validation mot de passe
function validerMdp() {
  const mdp = form.value.mot_de_passe
  if (!mdp) { mdpInvalide.value = false; return }
  if (mdp.length < 8) {
    mdpInvalide.value = true; mdpHint.value = 'Minimum 8 caractères'; return
  }
  if (!/[A-Z]/.test(mdp)) {
    mdpInvalide.value = true; mdpHint.value = 'Au moins 1 lettre majuscule'; return
  }
  if (!/[0-9]/.test(mdp)) {
    mdpInvalide.value = true; mdpHint.value = 'Au moins 1 chiffre'; return
  }
  mdpInvalide.value = false
}

async function charger() {
  chargement.value = true
  try {
    const res = await api.get('/users')
    utilisateurs.value = res.data.data
  } catch (e) { console.error(e) }
  finally { chargement.value = false }
}

function ouvrirCreation() {
  form.value = { nom: '', email: '', mot_de_passe: '', role: 'technicien' }
  erreurModal.value = ''
  emailInvalide.value = false
  mdpInvalide.value = false
  modalOuverte.value = true
}
function fermerModal() { modalOuverte.value = false }

function ouvrirModifRole(u) {
  userEnModif.value = u
  nouveauRole.value = u.role
  modalRoleOuverte.value = true
}
function fermerModalRole() { modalRoleOuverte.value = false }

async function confirmerRole() {
  try {
    await api.patch(`/users/${userEnModif.value.id}/role`, { role: nouveauRole.value })
    userEnModif.value.role = nouveauRole.value
    fermerModalRole()
    afficherToast(`Rôle mis à jour : ${nouveauRole.value}`)
  } catch (e) {
    afficherToast('Erreur lors du changement de rôle')
  }
}

async function creerUtilisateur() {
  erreurModal.value = ''
  validerEmail()
  validerMdp()

  if (!form.value.nom || !form.value.email || !form.value.mot_de_passe) {
    erreurModal.value = 'Tous les champs sont obligatoires'
    return
  }
  if (emailInvalide.value) { erreurModal.value = 'Email invalide'; return }
  if (mdpInvalide.value)   { erreurModal.value = mdpHint.value; return }

  creation.value = true
  try {
    await api.post('/users', form.value)
    fermerModal()
    await charger()
    afficherToast('Utilisateur créé avec succès')
  } catch (e) {
    erreurModal.value = e.response?.data?.message || 'Erreur lors de la création'
  } finally {
    creation.value = false
  }
}

async function toggleActif(user) {
  try {
    await api.patch(`/users/${user.id}/actif`, { actif: !user.actif })
    user.actif = !user.actif
    afficherToast(user.actif ? 'Utilisateur réactivé' : 'Utilisateur désactivé')
  } catch (e) { afficherToast('Erreur') }
}

let toastTimer = null
function afficherToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}

onMounted(charger)
</script>

<style scoped>
.admin-page { padding: 24px 20px; max-width: 1100px; margin: 0 auto; }

.admin-header {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px; gap: 12px;
}
.admin-titre { font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.admin-sous-titre { font-size: 13px; color: var(--ink-soft); }

.btn-primary {
  display: flex; align-items: center; gap: 7px;
  background: var(--accent); color: white; border: none;
  border-radius: 10px; padding: 10px 16px; font-size: 13px;
  font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #ea580c; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: white; border: 1px solid var(--border); color: var(--ink-soft); border-radius: 10px; padding: 10px 16px; font-size: 13px; font-weight: 500; cursor: pointer; }

.filtres-bar { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.filtre-role { display: flex; align-items: center; gap: 6px; background: white; border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 500; cursor: pointer; color: var(--ink-soft); }
.filtre-role.actif { background: var(--navy); border-color: var(--navy); color: white; }
.count { font-size: 11px; background: rgba(0,0,0,0.1); padding: 1px 5px; border-radius: 99px; }
.filtre-role.actif .count { background: rgba(255,255,255,0.2); }

.table-wrap { overflow: hidden; }
.btn-retour {
  background: none; border: none; cursor: pointer;
  color: var(--ink-soft); font-weight: 600; font-size: 13px;
  padding: 4px 0; margin-bottom: 16px; display: flex; align-items: center; gap: 4px;
}
/* Desktop table */
.desktop-table { width: 100%; border-collapse: collapse; }
.desktop-table th { text-align: left; font-size: 11px; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg); }
.desktop-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--ink); vertical-align: middle; }
.desktop-table tr:last-child td { border-bottom: none; }
.desktop-table tr.inactif td { opacity: 0.45; }
.desktop-table tr:hover td { background: var(--bg); }

/* Mobile cartes */
.mobile-cartes { display: none; flex-direction: column; }
.carte-user { padding: 14px 16px; border-bottom: 1px solid var(--border); }
.carte-user:last-child { border-bottom: none; }
.carte-user.inactif { opacity: 0.5; }
.carte-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.carte-right { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; flex-shrink: 0; }
.carte-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-md { width: 34px; height: 34px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.user-nom { font-weight: 600; font-size: 13px; }
.email { color: var(--ink-soft); font-size: 12px; }

.badge-role { font-size: 12px; font-weight: 500; text-transform: capitalize; color: var(--ink); }
.badge-statut { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; }
.badge-statut.actif { background: var(--success-soft); color: var(--success); }
.badge-statut.inactif-badge { background: var(--danger-soft); color: var(--danger); }
.badge-moi { font-size: 11px; font-weight: 600; color: var(--ink-soft); background: var(--bg); border: 1px solid var(--border); padding: 3px 9px; border-radius: 99px; }

.btn-icone { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 5px 8px; cursor: pointer; color: var(--ink-soft); display: inline-flex; align-items: center; gap: 4px; font-size: 12px; transition: all 0.15s; }
.btn-icone:hover { border-color: var(--accent); color: var(--accent); }
.tiret { color: var(--border-strong); }
.btn-action { font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px; border: none; cursor: pointer; }
.btn-action.desactiver { background: var(--danger-soft); color: var(--danger); }
.btn-action.activer    { background: var(--success-soft); color: var(--success); }
.vide-msg { text-align: center; color: var(--ink-soft); padding: 40px; font-size: 13px; }

.loader { display: flex; gap: 6px; justify-content: center; padding: 40px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse { 0%,80%,100% { opacity:0.3; transform:scale(0.8); } 40% { opacity:1; transform:scale(1); } }

.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { width: 100%; max-width: 440px; padding: 24px; }
.modal-sm { max-width: 340px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-titre { font-size: 17px; font-weight: 700; color: var(--ink); }
.modal-user-nom { font-size: 14px; font-weight: 600; margin-bottom: 16px; margin-top: -8px; }
.btn-fermer { background: none; border: none; cursor: pointer; color: var(--ink-soft); padding: 4px; border-radius: 4px; display: flex; }
.modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.input-erreur { border-color: var(--danger) !important; }
.hint-erreur { font-size: 11px; color: var(--danger); margin-top: 2px; display: block; }

.toast-succes { position: fixed; bottom: 24px; right: 24px; background: var(--success); color: white; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-md); z-index: 200; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ===== RESPONSIVE ===== */
@media (max-width: 700px) {
  .admin-page { padding: 16px 12px; }
  .admin-titre { font-size: 17px; }

  /* Tableau caché, cartes visibles */
  .desktop-table { display: none; }
  .mobile-cartes { display: flex; }

  /* Modal pleine largeur depuis le bas */
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal, .modal-sm {
    max-width: 100%; width: 100%;
    border-radius: 16px 16px 0 0;
    padding: 20px 16px 32px;
    max-height: 92vh; overflow-y: auto;
  }

  .toast-succes { right: 12px; left: 12px; text-align: center; bottom: 16px; }
  .filtre-role { font-size: 11px; padding: 5px 8px; }
}
</style>