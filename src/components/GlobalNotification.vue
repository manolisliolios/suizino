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