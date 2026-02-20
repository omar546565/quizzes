<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Background elements (stars/moon) could be added here -->
    <router-view v-slot="{ Component }">
      <transition 
        name="fade" 
        mode="out-in"
      >
        <component :is="Component" v-if="Component" />
      </transition>
    </router-view>
    
    <!-- Global audio elements for effects -->
    <div v-show="false">
      <audio ref="correctSound" src="/sounds/correct.mp3" preload="auto"></audio>
      <audio ref="wrongSound" src="/sounds/wrong.mp3" preload="auto"></audio>
      <audio ref="timerSound" src="/sounds/timer.mp3" preload="auto"></audio>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const correctSound = ref(null)
const wrongSound = ref(null)
const timerSound = ref(null)
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
