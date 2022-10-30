<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from "./components/AppHeader.vue";
import {useUiStore} from "./stores/ui";
import GlobalNotification from "./components/GlobalNotification.vue";


const uiStore = useUiStore();

</script>

<template>
  <div>
    <app-header/>
    <global-notification></global-notification>
    <RouterView />
  </div>

</template>

<style scoped>


</style>
