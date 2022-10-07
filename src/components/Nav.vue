<script setup>

</script>
<template>
    <div class="navbar">
        <router-link class="nav-link" to = '/morpion'>Morpion</router-link>
        <!-- <router-link class="nav-link" to = '/profil'>Profil</router-link> -->
        <router-link class="nav-link disconnect-btn" to = '/logout'>Disconnect</router-link>
    </div>
</template>
<style>
    .nav-link{
        padding: 5px;
        margin: 0px 50px 0px 50px;
        font-size: 1.1em;
        color: black;
        text-decoration: underline black;
        cursor: pointer;
    }

    .nav-link:hover{
        color: black;
        text-decoration: none;
    }
    .disconnect-btn{
        color: red;
        text-decoration: underline red;
    }

    .disconnect-btn:hover{
        color: white;
    }
</style>