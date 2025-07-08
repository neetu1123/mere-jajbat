<template>
    <div class="music-player-component">
        <!-- Music Player and Controls -->
        <div
            class="p-5 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/30 rounded-xl shadow-md">
            <h2 class="text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-music mr-2 text-pink-500"></i> Music Player
            </h2>

            <div class="flex flex-col md:flex-row gap-6">
                <!-- Now Playing -->
                <div class="flex-1">
                    <h3 class="font-medium mb-2 text-gray-700 dark:text-gray-300">Now Playing</h3>
                    <div class="flex items-center gap-4">
                        <div
                            class="h-16 w-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                            <i class="fas fa-music text-white text-2xl" v-if="!currentSong.cover"></i>
                            <img v-else :src="currentSong.cover" alt="Album cover"
                                class="h-full w-full object-cover rounded-lg" />
                        </div>
                        <div>
                            <p class="font-medium">{{ currentSong.title || 'No song selected' }}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">{{ currentSong.artist || 'Select a song to play' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Player Controls -->
                <div class="flex-1">
                    <audio ref="audioPlayerRef" @timeupdate="updateProgress" @ended="nextSong" @play="isPlaying = true"
                        @pause="isPlaying = false"></audio>

                    <!-- Autoplay warning message -->
                    <div v-if="!userHasInteracted && currentSong.title"
                        class="text-sm text-amber-600 dark:text-amber-400 mb-2 bg-amber-100 dark:bg-amber-900/30 p-2 rounded">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        Click the play button to start playback (browser autoplay restricted)
                    </div>

                    <!-- Format error message -->
                    <div v-if="formatError"
                        class="text-sm text-red-600 dark:text-red-400 mb-2 bg-red-100 dark:bg-red-900/30 p-2 rounded flex items-center justify-between">
                        <span>
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Audio format issue: Your browser couldn't play this file. This could be due to an
                            unsupported format or network issue.
                        </span>
                        <div class="flex gap-2">
                            <button @click="nextSong"
                                class="text-sm bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded hover:bg-blue-300 dark:hover:bg-blue-700">
                                Next Song
                            </button>
                            <button @click="resetFormatError"
                                class="text-sm bg-red-200 dark:bg-red-800 px-2 py-1 rounded hover:bg-red-300 dark:hover:bg-red-700">
                                Try Again
                            </button>
                        </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 cursor-pointer"
                        @click="seekAudio">
                        <div class="bg-pink-500 h-2 rounded-full" :style="`width: ${audioProgress}%`"></div>
                    </div>

                    <!-- Controls -->
                    <div class="flex items-center justify-between">
                        <button @click="prevSong" class="p-2 text-gray-600 dark:text-gray-300 hover:text-pink-500">
                            <i class="fas fa-step-backward"></i>
                        </button>

                        <button @click="togglePlay"
                            class="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-md hover:bg-pink-600">
                            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                        </button>

                        <button @click="nextSong" class="p-2 text-gray-600 dark:text-gray-300 hover:text-pink-500">
                            <i class="fas fa-step-forward"></i>
                        </button>

                        <div class="flex items-center">
                            <button @click="toggleMute"
                                class="p-2 text-gray-600 dark:text-gray-300 hover:text-pink-500">
                                <i :class="isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
                            </button>

                            <input type="range" min="0" max="1" step="0.01" v-model="volume"
                                class="w-20 accent-pink-500" @input="updateVolume" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Song Selection -->
            <div class="mt-6">
                <h3 class="font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Select Music</span>
                    <button @click="showUploadModal = true"
                        class="text-sm px-3 py-1 bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-800/60">
                        <i class="fas fa-upload mr-1"></i> Upload Music
                    </button>
                </h3>

                <div v-if="isLoading" class="flex justify-center items-center py-4">
                    <div class="spinner mr-2"></div>
                    <span>Loading songs...</span>
                </div>

                <div v-else-if="availableSongs.length === 0" class="text-center py-4">
                    <p class="text-gray-500 dark:text-gray-400">No songs available</p>
                    <button @click="showUploadModal = true"
                        class="mt-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                        Upload Your First Song
                    </button>
                </div>

                <div v-else class="flex flex-col sm:flex-row justify-between gap-4">
                    <!-- Quick Selection Dropdown -->
                    <div class="w-full sm:w-1/2 mb-4 sm:mb-0">
                        <div class="flex flex-col space-y-3">
                            <label class="block text-pink-700 dark:text-pink-400 font-medium mb-1">
                                <i class="fas fa-music mr-2"></i>Quick Song Selection
                            </label>
                            <select v-model="selectedSongPath"
                                class="border border-pink-300 dark:border-pink-500 rounded-lg p-3 w-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white"
                                @change="handleQuickSelect">
                                <option value="">-- Select a song --</option>
                                <option v-for="song in filteredSongs" :key="song.id || song.path" :value="song.path">
                                    {{ song.title }} - {{ song.artist || 'Unknown Artist' }}
                                </option>
                            </select>

                            <div>
                                <label class="block text-pink-700 dark:text-pink-400 font-medium mb-1">
                                    <i class="fas fa-filter mr-2"></i>Filter by Mood
                                </label>
                                <select v-model="selectedMood"
                                    class="border border-pink-300 dark:border-pink-500 rounded-lg p-3 w-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-800 dark:text-white"
                                    @change="filterByMood">
                                    <option value="">All Moods</option>
                                    <option value="happy">Happy</option>
                                    <option value="sad">Sad</option>
                                    <option value="love">Love</option>
                                    <option value="inspiration">Inspiration</option>
                                    <option value="nature">Nature</option>
                                    <option value="nostalgia">Nostalgia</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Visual Song Selection -->
                    <div class="w-full sm:w-1/2">
                        <label class="block text-pink-700 dark:text-pink-400 font-medium mb-2">
                            <i class="fas fa-th-large mr-2"></i>Browse Songs
                        </label>
                        <div
                            class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-pink-300 dark:border-pink-500 rounded-lg bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm">
                            <button v-for="song in filteredSongs" :key="song.id || song.path" @click="selectSong(song)"
                                class="p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                                :class="{ 'bg-pink-100 dark:bg-pink-900/30': currentSong.path === song.path }">
                                <div
                                    class="h-14 w-full bg-gray-100 dark:bg-gray-800 rounded-md mb-1 overflow-hidden flex items-center justify-center">
                                    <i v-if="!song.cover"
                                        class="fas fa-music text-gray-400 dark:text-gray-600 text-sm"></i>
                                    <img v-else :src="song.cover" alt="Album cover"
                                        class="h-full w-full object-cover" />
                                </div>
                                <p class="text-xs font-medium truncate">{{ song.title }}</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Music Upload Modal -->
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <h3 class="text-xl font-bold mb-4">Upload Music</h3>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Song Title *</label>
                    <input v-model="newSong.title" type="text" placeholder="Enter song title"
                        class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring focus:ring-pink-200" />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Artist</label>
                    <input v-model="newSong.artist" type="text" placeholder="Enter artist name"
                        class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring focus:ring-pink-200" />
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Mood Category</label>
                    <select v-model="newSong.mood"
                        class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring focus:ring-pink-200">
                        <option value="">-- Select Mood --</option>
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="love">Love</option>
                        <option value="inspiration">Inspiration</option>
                        <option value="nature">Nature</option>
                        <option value="nostalgia">Nostalgia</option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium mb-1">Music File *</label>
                    <input ref="musicFileInput" type="file" accept="audio/*" @change="handleMusicFileChange"
                        class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring focus:ring-pink-200" />
                </div>

                <div class="flex justify-end gap-3">
                    <button @click="showUploadModal = false"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                        Cancel
                    </button>
                    <button @click="handleUploadSubmit" :disabled="uploadingMusic || !newSong.file || !newSong.title"
                        class="px-4 py-2 bg-pink-500 text-white rounded-md disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700">
                        <i v-if="uploadingMusic" class="fas fa-spinner fa-spin mr-1"></i>
                        {{ uploadingMusic ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

// Get music player functionality from composable
const {
    audioPlayer,
    currentSong,
    isPlaying,
    isMuted,
    volume,
    audioProgress,
    availableSongs,
    isLoading,
    uploadingMusic,
    newSong,
    userHasInteracted,
    formatError,
    supportedFormats,
    setAudioPlayer,
    setupAudioEvents,
    fetchAvailableSongs,
    togglePlay,
    selectSong,
    prevSong,
    nextSong,
    toggleMute,
    resetFormatError,
    updateVolume,
    seekAudio,
    updateProgress,
    handleMusicFileChange,
    uploadMusic,
    filterSongsByMood
} = useMusicPlayer()

// Local refs
const audioPlayerRef = ref<HTMLAudioElement | null>(null)
const showUploadModal = ref(false)
const selectedSongPath = ref('')
const selectedMood = ref('')

// Filtered songs based on mood
const filteredSongs = computed(() => {
    if (!selectedMood.value) return availableSongs.value
    return filterSongsByMood(selectedMood.value)
})

// Quick select a song from dropdown
const handleQuickSelect = () => {
    if (!selectedSongPath.value) return

    const selectedSong = availableSongs.value.find(song => song.path === selectedSongPath.value)
    if (selectedSong) {
        selectSong(selectedSong)
    }
}

// Filter songs by mood
const filterByMood = () => {
    // Reset song selection if no matching songs in the new mood filter
    if (selectedSongPath.value) {
        const songExists = filteredSongs.value.some((song: Song) => song.path === selectedSongPath.value)
        if (!songExists) {
            selectedSongPath.value = ''
        }
    }
}



// Handle upload submit
const handleUploadSubmit = async () => {
    const result = await uploadMusic()

    if (result?.success) {
        showUploadModal.value = false
        // Show success notification or toast if available
    } else {
        alert(result?.message || 'Failed to upload music')
    }
}

// Initialize component
onMounted(() => {
    // Set audio player reference
    setAudioPlayer(audioPlayerRef.value);

    // Set up audio events for the player
    setupAudioEvents();

    // Fetch available songs and play the first one when ready
    fetchAvailableSongs().then((success) => {
        // Set default song if available and fetch was successful
        if (success && availableSongs.value.length > 0 && audioPlayerRef.value) {
            selectSong(availableSongs.value[0]);
        }
    });
})
</script>

<style scoped>
.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-left-color: #db2777;
    /* pink-600 */
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-color-scheme: dark) {
    .spinner {
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-left-color: #ec4899;
        /* pink-500 */
    }
}
</style>
