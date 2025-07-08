<template>
  <div class="shayari-card card-flip entry-animation rounded-xl overflow-hidden my-6"
    :class="`mood-bg-${shayari.mood || 'inspiration'}`">
    <div class="card-inner">
      <!-- Card header with author info -->
      <div class="flex justify-between items-center p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md">
        <div class="flex items-center">
          <span
            class="author-tag px-3 py-1 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            <i class="fas fa-user-edit mr-1"></i> {{ shayari.author }}
          </span>
        </div>
        <div class="flex gap-2">
          <span
            class="px-3 py-1 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
            <i class="fas fa-calendar mr-1"></i> {{ formatDate }}
          </span>
          <span
            class="px-3 py-1 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
            <i :class="moodIcon" class="mr-1"></i> {{ formatMood }}
          </span>
        </div>
      </div>

      <!-- Main content -->
      <div class="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
        <!-- Image if available -->
        <div v-if="shayari.imagePath" class="mb-4">
          <img :src="shayari.imagePath" alt="Shayari Image" class="rounded-lg w-full h-48 object-cover">
        </div>

        <!-- Shayari text -->
        <div class="shayari-text text-xl md:text-2xl whitespace-pre-wrap text-gray-800 dark:text-white leading-relaxed">
          {{ shayari.text }}
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-between items-center p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
        <div class="flex gap-2">
          <button @click="copyToClipboard"
            class="btn-effect p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/30">
            <i class="fas fa-copy"></i>
          </button>
          <button @click="shareShayari"
            class="btn-effect p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/30">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>

        <button @click="confirmDelete"
          class="btn-effect p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useShayari } from '~/composables/useShayari'

const props = defineProps({
  shayari: {
    type: Object,
    required: true
  }
})

const { deleteShayari } = useShayari()

// Format the date in a readable format
const formatDate = computed(() => {
  if (!props.shayari.date) return 'Unknown date'

  try {
    const date = new Date(props.shayari.date)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (err) {
    return 'Unknown date'
  }
})

// Format the mood name
const formatMood = computed(() => {
  const moodMap = {
    'happy': 'Happy',
    'sad': 'Sad',
    'love': 'Love',
    'inspiration': 'Inspiration',
    'nature': 'Nature',
    'nostalgia': 'Nostalgia'
  }

  return moodMap[props.shayari.mood] || props.shayari.mood
})

// Get mood icon
const moodIcon = computed(() => {
  const iconMap = {
    'happy': 'fas fa-smile',
    'sad': 'fas fa-heart-broken',
    'love': 'fas fa-heart',
    'inspiration': 'fas fa-lightbulb',
    'nature': 'fas fa-leaf',
    'nostalgia': 'fas fa-hourglass-half'
  }

  return iconMap[props.shayari.mood] || 'fas fa-star'
})

// Copy shayari text to clipboard
const copyToClipboard = () => {
  navigator.clipboard.writeText(props.shayari.text)
    .then(() => {
      alert('Shayari copied to clipboard!')
    })
    .catch(err => {
      console.error('Failed to copy text:', err)
    })
}

// Share shayari
const shareShayari = () => {
  if (navigator.share) {
    navigator.share({
      title: `Shayari by ${props.shayari.author}`,
      text: props.shayari.text,
      url: window.location.href
    }).catch(err => {
      console.error('Error sharing:', err)
    })
  } else {
    copyToClipboard() // Fallback to copy if Web Share API not available
  }
}

// Confirm and delete shayari
const confirmDelete = () => {
  if (confirm('Are you sure you want to delete this shayari?')) {
    deleteShayari(props.shayari.id)
  }
}
</script>
