<template>
  <div>
    <!-- Floating music player -->
    <div v-show="!isMinimized"
      class="floating-music-controls bg-white/20 dark:bg-gray-800/20 backdrop-blur-md p-4 rounded-xl shadow-lg"
      :class="{ 'hidden': isMinimized }">
      <audio ref="audioPlayerRef" controls loop class="w-full max-w-xs" @play="isPlaying = true"
        @pause="isPlaying = false">
        <source :src="currentMusic" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <div class="mt-2 flex justify-center">
        <button @click="toggleMinimized"
          class="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
    </div>

    <!-- Minimized player button -->
    <div v-show="isMinimized" @click="toggleMinimized"
      class="fixed bottom-5 right-5 bg-pink-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-pink-700 transition-all">
      <i :class="isPlaying ? 'fas fa-volume-up' : 'fas fa-music'"></i>
    </div>
  </div>
</template>

<script setup>
import { useAudio } from '~/composables/useAudio'

const props = defineProps({
  defaultMusic: {
    type: String,
    default: '/music/happ.mp3'
  }
})

const {
  audioPlayer,
  isPlaying,
  isMinimized,
  currentMusic,
  setAudioPlayer,
  toggleMinimized
} = useAudio()

const audioPlayerRef = ref(null)

onMounted(() => {
  // Set the audio player reference
  setAudioPlayer(audioPlayerRef.value)

  // Set default music source
  if (audioPlayerRef.value) {
    audioPlayerRef.value.src = props.defaultMusic
  }
})
</script>
