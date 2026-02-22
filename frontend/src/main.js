import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Import views
import Home from './views/Home.vue'
import Register from './views/Register.vue'
import QuizRoom from './views/QuizRoom.vue'
import Admin from './views/Admin.vue'
import Login from './views/Login.vue'
import Teams from './views/Teams.vue'
import InfoCategories from './views/InfoCategories.vue'
import InfoModels from './views/InfoModels.vue'
import InfoQuiz from './views/InfoQuiz.vue'
import axios from 'axios'

// Global Axios Config
const token = localStorage.getItem('adminToken')
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Axios Interceptor for 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken')
            delete axios.defaults.headers.common['Authorization']
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register/:quizId?', component: Register },
    { path: '/quiz/:quizId', component: QuizRoom, meta: { requiresAuth: true } },
    { path: '/admin', component: Admin, meta: { requiresAuth: true } },
    { path: '/teams', component: Teams, meta: { requiresAuth: true } },
    { path: '/info', component: InfoCategories },
    { path: '/info/:categoryId', component: InfoModels },
    { path: '/info/quiz/:modelId', component: InfoQuiz }
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
