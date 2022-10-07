
<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
  import kuzzle from "../services/kuzzle"
  import Nav from "../components/Nav.vue"

  import { onBeforeMount } from "vue";

  import { ref } from 'vue';



</script>
<template>
  <Nav v-if= '$route.meta.navbar' >Test</Nav>
  <router-view/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}


</style>
