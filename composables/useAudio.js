import { ref } from 'vue'

export const useAudio = () => {
  const audioPlayer = ref(null)
  const isPlaying = ref(false)
  const isMinimized = ref(false)
  const currentMusic = ref('')

  // Set audio player reference
  const setAudioPlayer = (el) => {
    audioPlayer.value = el
  }

  // Change music source
  const changeMusic = (source) => {
    if (audioPlayer.value) {
      const wasPlaying = !audioPlayer.value.paused

      // Update source
      currentMusic.value = source
      audioPlayer.value.src = source

      // If it was playing before, resume playback
      if (wasPlaying) {
        audioPlayer.value.play().catch(err => console.error('Error playing audio:', err))
        isPlaying.value = true
      }
    }
  }

  // Toggle play/pause
  const togglePlayback = () => {
    if (audioPlayer.value) {
      if (audioPlayer.value.paused) {
        audioPlayer.value.play().catch(err => console.error('Error playing audio:', err))
        isPlaying.value = true
      } else {
        audioPlayer.value.pause()
        isPlaying.value = false
      }
    }
  }

  // Toggle minimized state
  const toggleMinimized = () => {
    isMinimized.value = !isMinimized.value
  }

  // Handle custom audio file upload
  const handleCustomAudio = (file) => {
    if (file && audioPlayer.value) {
      const fileURL = URL.createObjectURL(file)
      changeMusic(fileURL)
    }
  }

  return {
    audioPlayer,
    isPlaying,
    isMinimized,
    currentMusic,
    setAudioPlayer,
    changeMusic,
    togglePlayback,
    toggleMinimized,
    handleCustomAudio
  }
}
