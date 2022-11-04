<script setup>
import { RouterView } from 'vue-router'
import {computed} from "vue";
import AppHeader from "./components/AppHeader.vue";
import GlobalNotification from "./components/GlobalNotification.vue";
import AppFooter from "./components/AppFooter.vue";
import {logo} from "./assets/icons";


const isWalletInstalled = computed(() => {
  console.log(window.suiWallet);
  return window && window.suiWallet;
})
</script>

<template>


  <div v-if="isWalletInstalled">
    <app-header/>
    <global-notification></global-notification>

    <RouterView />


  </div>
  <div v-else>
    <div class="text-center container mt-6">


      <div class="bg-red-700 rounded-lg  text-sm text-white w-fit px-3 py-2  flex items-center mx-auto">

        <div v-html="logo"></div>
        <p>
          Please <a href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil" rel="nofollow" class="underline" target="_blank">
          click here to install</a>  Sui Wallet extension on Google chrome to use this app.
        </p>

      </div>


    </div>

  </div>
  <app-footer></app-footer>




</template>

<style scoped>


</style>
