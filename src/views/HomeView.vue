<script setup>
import {ref, onMounted,onUnmounted, reactive} from 'vue'
import {logo} from "../assets/icons";
import {useAuthStore} from "../stores/auth";

const authStore = useAuthStore();


const emptyState = '?';


const spinningList = ["❌", "🦄", "✅", "🐻️", "🤑"];

const gameStarted = ref(false);
const totalGames = ref(0);
const wheelSlots = reactive([
  {
    id: 0,
    state: emptyState,
    started: false,
    randomSlides: [],
    ended: false
  },
  {
    id: 1,
    state: emptyState,
    randomSlides: [],
    started: false,
    ended: false
  },
  {
    id: 2,
    state: emptyState,
    randomSlides: [],
    started: false,
    ended: false
  }
]);

let initialSpinInterval;
onMounted(()=>{
  initialSpinInterval = setupSpinningInterval(200);
});

const setupSpinningInterval = (timeout) => {
  return setInterval(()=> {
    for (let slot of wheelSlots) {

      if(slot.ended) continue; // if slot selection ended. continue!

      // if slot slection has started, we pick one and then break
      if(slot.started){
        slot.randomSlides = spinningList.sort(() => 0.5 - Math.random()).slice(0,1);
        slot.ended = true;

        if(slot.id === wheelSlots.length - 1) checkGameStatus();
        continue;
      }

      slot.randomSlides = spinningList.sort(() => 0.5 - Math.random()).slice(0,3);
    }
  }, timeout);
}

const clearSpinningInterval = () => {
  clearInterval(initialSpinInterval);
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
  setupSpinningInterval();
}
const startGame = () => {
  if(gameStarted.value) return;
  totalGames.value++;
  resetGame();
  gameStarted.value = true;
  for(let [index, slot] of wheelSlots.entries()){

    setTimeout(()=>{
      slot.started = true;
    }, (index+2) * 600); // start wih 300ms difference
  }
}

const checkGameStatus = () =>{
  clearSpinningInterval();
  gameStarted.value = false;
  console.log(wheelSlots);
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
        <button v-if="!gameStarted && authStore.hasWalletPermission" class="bg-gray-800 mx-auto ease-in-out duration-500 hover:px-10 dark:bg-gray-800 flex items-center text-white px-5 py-2 rounded-full"
                @click="startGame">
          <div v-html="logo" class="logo-icon"></div>
          {{totalGames === 0 ? 'SPIN NOW': 'PLAY AGAIN'}} <span class="ml-2 text-sm">(0.005 Sui)
        </span>
        </button>
      </div>
    </div>
  </main>
</template>
