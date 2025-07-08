<template>
  <div class="mb-6 p-4 bg-pink-50 dark:bg-gray-700/40 rounded-xl">
    <div class="flex flex-col sm:flex-row justify-between gap-4">
      <div class="w-full sm:w-1/2">
        <label class="block text-pink-700 dark:text-pink-400 font-medium mb-2">
          <i class="fas fa-music mr-2"></i>Choose Your Music
        </label>
        <select v-model="selectedMusic"
          class="border border-pink-300 dark:border-pink-500 rounded-lg p-3 w-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white"
          @change="handleMusicChange">
          <option value="/music/happ.mp3">Happy Vibes</option>
          <option value="/music/128-Shiddat Title Track - Shiddat 128 Kbps.mp3">Sad Soul</option>
          <option value="/music/128-Chitta - Shiddat 128 Kbps.mp3">Romantic Strings</option>
          <option value="/music/happ.mp3">Inspiring Melody</option>
          <option value="/music/happ.mp3">Nature Sounds</option>
          <option value="/music/happ.mp3">Nostalgic Tunes</option>
        </select>
      </div>

      <div class="w-full sm:w-1/2">
        <label class="block text-pink-700 dark:text-pink-400 font-medium mb-2">
          <i class="fas fa-upload mr-2"></i>Upload Your Music
        </label>
        <input type="file" accept="audio/*"
          class="w-full border border-pink-300 dark:border-pink-500 rounded-lg p-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white"
          @change="uploadCustomAudio" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAudio } from '~/composables/useAudio'

const { changeMusic: changeMusicFn, handleCustomAudio } = useAudio()
const selectedMusic = ref('/music/happ.mp3')

// Change music when selection changes
const handleMusicChange = () => {
  console.log('Changing music to:', selectedMusic.value)
  changeMusicFn(selectedMusic.value)
}

onMounted(() => {
  console.log('MusicSettings component mounted')
})

// Handle custom audio upload
const uploadCustomAudio = (event) => {
  const file = event.target.files[0]
  handleCustomAudio(file)
}
</script>
