import { createApp } from 'vue'
import './style.css'
import {createRouter, createWebHistory} from 'vue-router'

import kuzzle from "./services/kuzzle"
import App from './vues/App.vue'
import Morpion from './vues/Morpion.vue'
import Login from './vues/Login.vue'
import Signup from './vues/Signup.vue'


async function checkAuth(){
    await kuzzle.connect()
    if(!localStorage.getItem('jwt')){
        router.push('Login')
    }else{

        try {
            let auth = await kuzzle.auth.checkToken(localStorage.getItem('jwt'))
            if(!auth.valid){
            router.push('Login')
            }
            console.log("auth")
        }
        catch(error){
            console.log(error)
        }
                
    }
  }

const routes = [
    {
        path: '/', component: App
    },
    {path: '/morpion', name: 'Morpion', component: Morpion, beforeEnter: await checkAuth},
    {path: '/login', name: 'Login', component: Login},
    {path: '/signup', name: 'Signup', component: Signup}

]


const router = createRouter({
    history: createWebHistory(),
    routes,
})




createApp(App).use(router).mount('#app')
