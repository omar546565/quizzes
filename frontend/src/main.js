import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Import views (to be created)
import Home from './views/Home.vue'
import Register from './views/Register.vue'
import QuizRoom from './views/QuizRoom.vue'
import Admin from './views/Admin.vue'
import Login from './views/Login.vue'
import Teams from './views/Teams.vue'
import axios from 'axios'

// Global Axios Config
const token = localStorage.getItem('adminToken')
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register/:quizId?', component: Register },
    { path: '/quiz/:quizId', component: QuizRoom, meta: { requiresAuth: true } },
    { path: '/admin', component: Admin, meta: { requiresAuth: true } },
    { path: '/teams', component: Teams, meta: { requiresAuth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !localStorage.getItem('adminToken')) {
        next('/login')
    } else {
        next()
    }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
