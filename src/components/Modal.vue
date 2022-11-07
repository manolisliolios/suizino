<script setup>

import {x_btn} from "../assets/icons";

const props = defineProps({
  bodyClasses: String
})
</script>

<template>


  <transition name="slide-fade">
    <div class="modal-wrap fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center">
      <div class="modal-backdrop absolute top-0 left-0 right-0 bottom-0 bg-[#00000030] dark:bg-[#f9f9f920]" @click="$emit('closeModal')"></div>
      <div class="modal relative bg-white dark:bg-gray-900 w-6/12 rounded-lg p-10" :class="bodyClasses">
        <div v-html="x_btn" class="absolute ease-in-out duration-300 top-2 right-2 cursor-pointer hover:rotate-12" @click="$emit('closeModal')"></div>
        <slot></slot>
      </div>
    </div>
  </transition>

</template>