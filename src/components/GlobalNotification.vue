<template>


  <transition name="slide-fade">
  <div v-if="uiStore.notification.value" class="fixed left-0 ease-in-out duration-300 right-0 top-4" @click="uiStore.setNotification(null)">
    <div :class="getNotificationClasses" class="py-3 text-sm px-6 mx-auto border-l-4 w-fit rounded">
      {{uiStore.notification.value}}
    </div>
  </div>
  </transition>


</template>

<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
<script setup>


import {useUiStore} from "../stores/ui";
import {computed, ref, watch, reactive} from "vue";

const uiStore = useUiStore();

let timeout = reactive(null);

// auto hide in 3 seconds
watch(() => uiStore.notification.value, (val) => {

  if(val){
    console.log(timeout);
    if(timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {uiStore.setNotification(null)}, 3000);
  }
})


const getNotificationClasses = computed(() => {
  if(uiStore.notification.type === uiStore.notificationTypes.error) return 'bg-red-200 text-red-900 border-red-900';
  if(uiStore.notification.type === uiStore.notificationTypes.success) return 'bg-green-300 border-green-900 text-green-800';
  return 'bg-blue-300';
})

</script>