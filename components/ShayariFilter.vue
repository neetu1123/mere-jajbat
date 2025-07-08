<template>
  <div
    class="relative p-6 border border-pink-100 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-xl shadow-sm mb-8">
    <div
      class="absolute top-0 left-6 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1 rounded-full text-white text-sm font-medium shadow-md">
      <i class="fas fa-filter mr-1"></i> Find & Filter
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      <!-- Search input -->
      <div class="relative">
        <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1 ml-1">Search content</label>
        <div class="relative">
          <input v-model="searchTerm" type="text" placeholder="Search shayaris..."
            class="w-full border border-pink-300/50 dark:border-pink-500/30 rounded-lg pl-10 pr-3 py-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-300">
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <!-- Mood filter -->
      <div>
        <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1 ml-1">Filter by mood</label>
        <select v-model="selectedMood"
          class="w-full border border-pink-300/50 dark:border-pink-500/30 rounded-lg px-3 py-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-300">
          <option value="">All Moods</option>
          <option value="happy">😊 Happy</option>
          <option value="sad">💔 Sad</option>
          <option value="love">❤️ Love</option>
          <option value="inspiration">✨ Inspiration</option>
          <option value="nature">🌿 Nature</option>
          <option value="nostalgia">🕰️ Nostalgia</option>
        </select>
      </div>

      <!-- Author filter -->
      <div>
        <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1 ml-1">Filter by author</label>
        <select v-model="selectedAuthor"
          class="w-full border border-pink-300/50 dark:border-pink-500/30 rounded-lg px-3 py-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-300">
          <option value="">All Authors</option>
          <option v-for="author in uniqueAuthors" :key="author" :value="author">
            {{ author }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex justify-between items-center mt-4">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ filteredCount }} results found
      </div>

      <div class="flex gap-2">
        <button @click="resetFilters"
          class="btn-effect px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300">
          <i class="fas fa-undo mr-1"></i> Reset
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  uniqueAuthors: {
    type: Array,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['filter-changed'])

const searchTerm = ref('')
const selectedMood = ref('')
const selectedAuthor = ref('')

// Computed property for filtered count
const filteredCount = computed(() => {
  return props.totalCount
})

// Watch for changes and emit filter change event
watch([searchTerm, selectedMood, selectedAuthor], () => {
  emit('filter-changed', {
    searchTerm: searchTerm.value,
    mood: selectedMood.value,
    author: selectedAuthor.value
  })
}, { deep: true })

// Reset all filters
const resetFilters = () => {
  searchTerm.value = ''
  selectedMood.value = ''
  selectedAuthor.value = ''
}
</script>
