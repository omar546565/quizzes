<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Background elements (stars/moon) could be added here -->
    <router-view v-slot="{ Component }">
      <transition 
        name="fade" 
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Global audio elements for effects -->
    <audio ref="correctSound" src="/sounds/correct.mp3" preload="auto"></audio>
    <audio ref="wrongSound" src="/sounds/wrong.mp3" preload="auto"></audio>
    <audio ref="timerSound" src="/sounds/timer.mp3" preload="auto"></audio>
  </div>
</template>

<script setup>
// Global setup if needed
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
