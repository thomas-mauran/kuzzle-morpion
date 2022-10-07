import { createApp } from 'vue'
import './style.css'
import {createRouter, createWebHistory} from 'vue-router'

import kuzzle from "./services/kuzzle"
import App from './vues/App.vue'
import Morpion from './vues/Morpion.vue'
import Login from './vues/Login.vue'
import Signup from './vues/Signup.vue'
import Logout from './vues/Logout.vue'



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
        path: '/', component: Login, 
    },
    {path: '/morpion', name: 'Morpion', component: Morpion, beforeEnter: checkAuth, meta: {navbar: true}},
    {path: '/login', name: 'Login', component: Login, meta: {navbar: false}},
    {path: '/signup', name: 'Signup', component: Signup, meta: {navbar: false}},
    {path: '/logout', name: 'Logout', component: Logout, meta: {navbar: false}}


]


const router = createRouter({
    history: createWebHistory(),
    routes,
})




createApp(App).use(router).mount('#app')
