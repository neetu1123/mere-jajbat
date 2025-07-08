<template>
  <div class="theme-selector">
    <button @click="toggleTheme"
      class="p-2 rounded-full bg-white/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/50">
      <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" class="text-gray-800 dark:text-gray-200"></i>
    </button>
  </div>
</template>

<script setup>
import { useTheme } from '~/composables/useTheme'

const { isDarkMode, toggleTheme } = useTheme()
</script>
