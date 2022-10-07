<script setup>
    import kuzzle from "../services/kuzzle"
    import {ref} from "vue"    
    import { useRouter } from 'vue-router';

    const router = useRouter()

    let error_msg = ref('')
    let username = ref('')
    let password = ref('')
    let confirm_password = ref('')

    let btnMsg = ref('Signup')


    async function signup(){
        btnMsg.value = 'Loading'
        await kuzzle.connect()
        if(username.value == '' || password.value == '' || confirm_password.value == ''){
            error_msg.value = "You must fill in all the fields"
            btnMsg.value = 'Signup'

            return

        }
        if(password.value != confirm_password.value){
            error_msg.value = "Both passwords are not the same"
            btnMsg.value = 'Signup'

            return
        }

        let user = {
            content: {
                profileIds: ['default'],
                username: username.value
            },
            credentials:{
                "local": {
                    "username": username.value,
                    "password": password.value
                }
            }


        }
        let options = {}


        try {
            let jwt = await kuzzle.security.createUser(username.value, user, options)

            console.log('good')
            router.push('Login')
            
        }
        catch (error){
            console.log('error')
            console.log(error)
            error_msg.value = 'username already exists'
            btnMsg.value = 'Signup'

        }

    }

</script>

<template>
    <div class="vertical-div">
        <h3 v-if="error_msg != ''" class="error-msg">{{error_msg}}</h3>
        <h2>Username : </h2>
        <input class="input-text" type="text" name="login" v-model="username">

        <h2>Password: </h2>
        <input class="input-text" type="password" name="password" v-model="password">

        <h2>Confirm Password: </h2>
        <input class="input-text" type="password" name="confirm_password" v-model="confirm_password">
    </div>
    <div>
        <router-link to="login">Already have an account</router-link>

    </div>
    <button @click="signup" id="connect-btn">{{btnMsg}}</button>
</template>

<style>
    .error-msg{
        color: rgb(217, 95, 95);

    }
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