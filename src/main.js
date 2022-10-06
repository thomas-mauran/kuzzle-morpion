import { createApp } from 'vue'
import './style.css'
import {createRouter, createWebHistory} from 'vue-router'

import App from './vues/App.vue'
import Morpion from './vues/Morpion.vue'

const routes = [
    {
        path: '/', component: App
    },
    {path: '/morpion', component: Morpion}
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})




createApp(App).use(router).mount('#app')
