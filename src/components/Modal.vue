<script setup>
</script>

<template>


  <div class="modal-wrap fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center">
    <div class="modal-backdrop absolute top-0 left-0 right-0 bottom-0 bg-[#00000030]" @click="$emit('closeModal')"></div>
    <div class="modal relative bg-white w-10/12 md:w-8/12 lg:w-6/12 xl:w-[4/12] min-h-[35vh] rounded-lg p-10 dark:bg-gray-500">
      <slot></slot>
    </div>
  </div>

</template>