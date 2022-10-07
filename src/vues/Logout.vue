<script setup>
    import {useRouter} from "vue-router"

    let router = useRouter()
    localStorage.clear()
    router.push("Login")
</script>
<template></template>
<style></style>