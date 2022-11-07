<script setup>
import { RouterView } from 'vue-router'
import AppHeader from "./components/AppHeader.vue";
import GlobalNotification from "./components/GlobalNotification.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>


  <div >
    <app-header/>
    <global-notification></global-notification>

    <RouterView />


  </div>
  <app-footer></app-footer>




</template>
