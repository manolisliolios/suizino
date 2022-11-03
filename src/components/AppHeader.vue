<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {walletAccess} from "../helpers/wallet";
import {useUiStore} from "../stores/ui";
import {logo} from "../assets/icons";
import {moduleAddress, moduleName, casinoAddress} from "../helpers/constants";

const {provider, isPermissionGranted, logout, permissionGrantedError, requestWalletAccess, executeMoveCall, getAddress } = walletAccess();
const uiStore = useUiStore();

// component state
const state = reactive({
  showModal: true,
  profile: null
});
import { useDark, useToggle } from '@vueuse/core';
const isDark = useDark();
const toggleDark = useToggle(isDark);


onMounted(()=>{
  // setDarkMode(darkMode);
})


watch(permissionGrantedError, (val) => {
  if(val) uiStore.setNotification(val);
});

watch(isPermissionGranted, val => {
  if(val){
    uiStore.setNotification('Successfully logged in.', 'success');
    getCasinoProfileNFT();
  }
});

const disconnect = () => {
  logout();
  state.profile = null;
}

const mintPersonalNFT = (description, image) => {
  executeMoveCall({
    packageObjectId: "0x2",
    module: "devnet_nft",
    function: "mint",
    typeArguments: [],
    arguments: ["Suizino_Profile", "Manolis Liolios", "https://picsum.photos/500/500"],
    gasBudget: 1000
  }).then(res =>{
    console.log(res);
  }).catch(e=>{
    uiStore.setNotification(e.message);
  });
}

const burnNFT = (id) => {
  executeMoveCall({
    packageObjectId: "0x2",
    module: "devnet_nft",
    function: "burn",
    typeArguments: [],
    arguments: [id],
    gasBudget: 1000
  }).then(res =>{
    console.log(res);
  }).catch(e=>{
    uiStore.setNotification(e.message);
  });
}


// gamble(state.profile);
const depositToCasino = async () => {

  const address = getAddress();
  if(!address) return;

  return executeMoveCall({
        packageObjectId: moduleAddress,
        module: moduleName,
        typeArguments: [],
        arguments: ["0x945274fcbaa05b9fe1c04499fda3215a271f5171",casinoAddress,"5000", '0x1f2c403491553c1e3f9a9ea27260d020660e8f74'],
        function: 'depositToCasino',
        gasBudget: 1000
  })
}
// depositToCasino();

// depositToCasino().then(res=>{
//   console.log(res);
// })

const getCasinoProfileNFT = () => {

  const address = getAddress();
  if(!address) return;

  provider.getObjectsOwnedByAddress(address).then(res =>{
    let nfts = res.filter(x => x.type.includes('DevNetNFT'));
    provider.getObjectBatch(nfts.map(x => x.objectId)).then(res =>{

      let validObject = res.find(x => x?.details?.data?.fields?.name === 'Suizino_Profile');

      if(!validObject){

        // we need to mint our profile NFT!
        return;
      }
      state.profile = validObject.details.data.fields;

    })
  }).catch(e =>{
    uiStore.setNotification(e.message);
  });
}
if(isPermissionGranted) getCasinoProfileNFT();
</script>

<template>
  <header id="header" class="container">

      <div class="grid grid-cols-12 gap-5 py-6 items-center">

        <div class="col-span-4">

          <h3 class="text-2xl">
            Suizino
          </h3>


        </div>

        <div class="col-span-8 justify-self-end flex items-center">


          <button @click="toggleDark()" class="mr-3">
            <svg v-if="!isDark" id="theme-toggle-dark-icon" class=" w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            <svg v-if="isDark" id="theme-toggle-light-icon" class=" w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                                                                                                                                               fill-rule="evenodd" clip-rule="evenodd">
            </path>
            </svg>
          </button>
          <div v-if="isPermissionGranted && state.profile" class="mr-2 flex items-center text-sm">
            <img :src="state.profile.url" class="w-[35px] h-[35px] rounded-full mr-2">
            Welcome back, {{state.profile.description}}
          </div>

<!--          <button class="bg-gray-800 dark:bg-gray-800 flex items-center text-white px-5 py-2 rounded-full mr-2" @click="executeGamble">gamble</button>-->
<!--          <button class="bg-gray-800 dark:bg-gray-800 flex items-center text-white px-5 py-2 rounded-full" @click="depositToCasino">Deposit to Casino</button>-->
          <button v-if="!isPermissionGranted"
                  class="bg-gray-800 dark:bg-gray-800 flex items-center text-white px-5 py-2 rounded-full" @click="requestWalletAccess()">
            <div v-html="logo" class="logo-icon"></div> Connect Sui Wallet
          </button>

          <button v-else class="bg-gray-300 text-gray-900 px-3 py-2 rounded-full" @click="disconnect">
            Logout
          </button>
        </div>
      </div>

  </header>
</template>

<style>
.logo-icon svg{
  @apply w-[20px] h-[20px]
}
</style>

