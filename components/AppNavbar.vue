<template>
  <nav class="fixed top-0 left-0 right-0 z-40 glass-effect backdrop-blur-xl bg-white/10 dark:bg-gray-900/10">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <img src="https://img.icons8.com/fluency/96/null/feather.png" alt="Feather"
              class="h-8 w-8 mr-2 animate__animated animate__pulse animate__infinite animate__slow" />
            <h2 class="text-xl font-bold text-pink-700 dark:text-pink-400">Mere Jazbaat</h2>
          </NuxtLink>
        </div>
        <div class="flex items-center gap-4">
          <!-- <button @click="$emit('toggle-settings')"
            class="p-2 rounded-full bg-white/20 backdrop-blur-sm shadow hover:bg-white/30 transition-all duration-300">
            <i class="fas fa-cog text-gray-700 dark:text-gray-300"></i>
          </button> -->
          <ThemeToggle />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'

defineEmits(['toggle-settings'])
</script>
