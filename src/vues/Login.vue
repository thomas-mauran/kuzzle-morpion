<script setup>

import kuzzle from "../services/kuzzle"
import {ref} from "vue"    
import { useRouter } from 'vue-router';


    let router = useRouter()
   
    let username = ref('')
    let password = ref('')
    let error_msg = ref('')

    let btnMsg = ref('Connect')


    async function connect(){
        btnMsg.value = 'Loading'

        await kuzzle.connect()
        try {
            
            const jwt = await kuzzle.auth.login('local', {username: username.value, password: password.value});
            console.log("connected")
            localStorage.setItem('jwt', jwt)
            
            router.push('Morpion')

        }
        catch{
            error_msg.value = 'Username or password incorrect'
        }
    }

</script>

<template>
    <div class="vertical-div">
        <h2 v-if="error_msg != ''" class="error-msg">{{error_msg}}</h2>

        <h2>Login : </h2>
        <input class="input-text" type="text" name="login" v-model="username">

        <h2>Password: </h2>
        <input class="input-text" type="password" name="password" v-model="password">
    </div>
    <div>
        <router-link to="Signup">Create an account</router-link>
    </div>

    <button @click="connect" id="connect-btn">Connect</button>
</template>

<style>
    .vertical-div{
        display: flex;
        flex-direction: column;
    }
    .input-text{
        border-radius: 5px;
        font-size: 1.5em;
    }

    #connect-btn{
        margin: 20px;
        background-color: rgb(216, 132, 73);
        font-weight: bold;
    }
</style>