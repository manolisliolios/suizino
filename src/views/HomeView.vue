<script setup>
import {ref, onMounted,onUnmounted, reactive} from 'vue'
import {logo} from "../assets/icons";
import {useAuthStore} from "../stores/auth";
import {casinoAddress, moduleAddress} from "../helpers/constants";
import {walletAccess} from "../helpers/wallet";
import {useUiStore} from "../stores/ui";

const authStore = useAuthStore();
const uiStore = useUiStore();
const {executeMoveCall, getAddress} = walletAccess();


const spinningList = ["❌", "🦄", "✅", "🐻️", "🤑"];

const gameStarted = ref(false);
const isLoading = ref(false);

const gameResults = ref([]);
const totalGames = ref(0);
const wheelSlots = reactive([
  {
    id: 0,
    started: false,
    randomSlides: [],
    ended: false
  },
  {
    id: 1,
    randomSlides: [],
    started: false,
    ended: false
  },
  {
    id: 2,
    randomSlides: [],
    started: false,
    ended: false
  }
]);

let initialSpinInterval = ref();
onMounted(()=>{
  initialSpinInterval.value = setupSpinningInterval(120);
});

const executeGamble = () => {
  const address = getAddress();
  if(!address) return;
  if(gameStarted.value) return;
  resetGame();
  gameStarted.value = true;
  isLoading.value = true;

  executeMoveCall({
    packageObjectId: moduleAddress,
    module: 'Suizino_core',
    typeArguments: [],
    arguments: [casinoAddress, '0x7d8894b58942a2d550ddedfe88fcfb3a20000321'],
    function: 'gamble',
    gasBudget: 1000
  }).then(res =>{
    console.log(res);
    totalGames.value++;
    const status = res?.effects?.status?.status;

    if(status === 'success'){
      let SuizinoEventResult = res?.effects?.events?.find(x => x.moveEvent) || {};

      let fields = SuizinoEventResult?.moveEvent?.fields;

      gameResults.value = [fields.slot_1, fields.slot_2, fields.slot_3];
      console.log(gameResults);
      console.log(fields.winnings);
      for(let [index, slot] of wheelSlots.entries()){

        setTimeout(()=>{
          slot.started = true;
        }, (index+2) * 600); // start wih 300ms difference
      }

    }
  }).catch(e=>{
    resetGame();

    uiStore.setNotification(e.message);
    console.log(e);
  })
}


const setupSpinningInterval = (timeout) => {
  return setInterval(()=> {
    for (let slot of wheelSlots) {

      if(slot.ended) continue; // if slot selection ended. continue!

      // if slot slection has started, we pick one and then break
      if(slot.started){
        slot.randomSlides = [spinningList[gameResults.value[slot.id]]];
        slot.ended = true;

        if(slot.id === wheelSlots.length - 1) checkGameStatus();
        continue;
      }

      slot.randomSlides = spinningList.sort(() => 0.5 - Math.random()).slice(0,3);
    }
  }, timeout);
}

const clearSpinningInterval = () => {
  clearInterval(initialSpinInterval.value);
}

onUnmounted(()=>{
  clearSpinningInterval();
});
const resetGame = () => {
  for(let slot of wheelSlots){
    slot.randomSlides = [];
    slot.started = false;
    slot.ended = false;
  }
  isLoading.value = false;
  gameStarted.value = false;
  gameResults.value = null;
  setupSpinningInterval(120);
}
const startGame = () => {
}

const checkGameStatus = () =>{
  clearSpinningInterval();
  gameStarted.value = false;
  isLoading.value = false;
  let hasWon = true;
  let icon = null;


  for(let slot of wheelSlots){
    if(!icon) {
      icon = slot.randomSlides[0];
      continue;
    }

    if(icon !== slot.randomSlides[0]){
      hasWon = false;
      break;
    }
  }

  if(hasWon){
    alert('BIG WIN!');
  }
}



</script>

<style>
</style>

<template>
  <main class="container">

<!--    <h2>Please login to continue</h2>-->
    <div class="max-w-[700px] mx-auto mb-20 mt-6">

      <div class="py-6 text-center">
        <h2 class="text-3xl font-bold">
          🎉 Welcome to Suizino 🎉
        </h2>
        <p>
          Spin now and win big rewards!
        </p>

      </div>
      <div class="lucky-wheel-slots grid grid-cols-3 gap-2 md:gap-5">
        <div v-for="slot of wheelSlots"
             :key="slot.id"
             :id="`wheel-slot-${slot.id}`"
             class="lucky-wheel-slot bg-white overflow-hidden dark:bg-gray-700 h-[250px] md:h-[320px] rounded-lg shadow flex items-center justify-center"
          :class="slot.ended ? 'border border-gray-700' : ''">

          <div class="">
            <div v-for="(item,index) in slot.randomSlides" class="block w-full text-center text-5xl md:text-6xl py-6 ">
              {{item}}
            </div>
          </div>

        </div>
      </div>
      <div class="mt-6 text-center">
        <button v-if="authStore.hasWalletPermission"
                class="bg-gray-800 mx-auto ease-in-out duration-500 hover:px-10 dark:bg-gray-800 flex items-center text-white px-5 py-2 rounded-full"
                :class="isLoading ? 'opacity-70 cursor-default hover:px-5': ''"
                @click="executeGamble">

          <div v-if="isLoading">
            <svg aria-hidden="true" class="w-5 h-5 text-gray-200 animate-spin dark:text-white fill-gray-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"/>
            </svg>
          </div>
          <span v-else class="flex items-center">
            <div v-html="logo" class="logo-icon"></div>
            {{totalGames === 0 ? 'SPIN NOW': 'PLAY AGAIN'}} <span class="ml-2 text-sm">(0.005 Sui)
        </span>
          </span>

        </button>
      </div>
    </div>
  </main>
</template>
