<script setup>
import {reactive, watch} from "vue";
import {walletAccess} from "../helpers/wallet";
import {useUiStore} from "../stores/ui";
import {logo} from "../assets/icons";

const {provider, isPermissionGranted, logout, permissionGrantedError, requestWalletAccess, executeMoveCall, getAddress } = walletAccess();
const uiStore = useUiStore();

const profileNft = reactive({
  profile: null
});

watch(permissionGrantedError, (val) => {
  if(val) uiStore.setNotification(val);
});

watch(isPermissionGranted, val => {
  if(val){
    uiStore.setNotification('Successfull login', 'success');
    getCasinoProfileNFT();
  }
});

const disconnect = () => {
  logout();
  profileNft.profile = null;
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
      profileNft.profile = validObject.details.data.fields;

    })
  }).catch(e =>{
    uiStore.setNotification(e.message);
  });
}
if(isPermissionGranted) getCasinoProfileNFT();
</script>

<template>
  <header id="header" class="container">

    <div class=" px-5">
      <div class="grid grid-cols-2 gap-5 py-6 items-center">

        <div>

          <h3 class="text-2xl text-gray-800">
            Suizino
          </h3>

        </div>

        <div class="justify-self-end flex items-center">

          <div v-if="isPermissionGranted && profileNft.profile" class="mr-2 flex items-center text-sm">
            <img :src="profileNft.profile.url" class="w-[35px] h-[35px] rounded-full mr-2">
            Welcome back, {{profileNft.profile.description}}
          </div>
          <button v-if="!isPermissionGranted" class="bg-gray-800 flex items-center text-white px-3 py-2 rounded-full" @click="requestWalletAccess()">
            <div v-html="logo" class="logo-icon"></div> Connect Sui Wallet
          </button>

          <button v-else class="bg-gray-300 text-gray-900 px-3 py-2 rounded-full" @click="disconnect">
            Logout
          </button>
        </div>

      </div>
    </div>


  </header>
</template>

<style>
.logo-icon svg{
  @apply w-[20px] h-[20px]
}
</style>

