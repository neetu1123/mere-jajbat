import { ref, onMounted, watch, computed } from 'vue'

/**
 * Song interface representing a music track
 */
export interface Song {
    id?: string
    title: string
    artist: string
    path: string
    cover?: string
    filename?: string
    uploaded?: string
    mood?: string
}

/**
 * API response interface
 */
interface ApiResponse {
    success: boolean
    message?: string
    data?: any
}

/**
 * Music player composable
 * Provides functionality for audio playback, song management, and music uploads
 */
export const useMusicPlayer = () => {
    // ==============================
    // STATE
    // ==============================

    // Player core state
    const audioPlayer = ref<HTMLAudioElement | null>(null)
    const currentSong = ref<Song>({
        title: '',
        artist: '',
        path: '',
        cover: ''
    })
    const isPlaying = ref(false)
    const isMuted = ref(false)
    const volume = ref(1)
    const audioProgress = ref(0)

    // Song management state
    const availableSongs = ref<Song[]>([])
    const isLoading = ref(false)

    // Upload state
    const uploadingMusic = ref(false)
    const newSong = ref({
        title: '',
        artist: '',
        mood: '',
        file: null as File | null
    })

    // API endpoints
    const apiUrls = {
        listMusic: '/api/music/list',
        uploadMusic: '/api/music/upload',
        streamMusic: '/api/music/stream'
    }

    /**
     * Tracks if there was a format error with the current song
     */
    const formatError = ref(false)

    // ==============================
    // METHODS
    // ==============================

    /**
     * Sets the audio player element reference
     */
    const setAudioPlayer = (el: HTMLAudioElement | null) => {
        audioPlayer.value = el
    }

    /**
     * Fetches available songs from the API
     * Validates and normalizes song data
     * @returns Promise<boolean> indicating if fetch was successful
     */
    const fetchAvailableSongs = async (): Promise<boolean> => {
        try {
            isLoading.value = true;
            const response = await $fetch<ApiResponse>(apiUrls.listMusic);

            if (response?.success && Array.isArray(response.data)) {
                // Map and normalize the data
                availableSongs.value = response.data
                    .filter((song: any) => song && (song.path || song.filename)) // Ensure we have at least a path
                    .map((song: any) => ({
                        id: song.id || `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        title: song.title || 'Unknown Title',
                        artist: song.artist || 'Unknown Artist',
                        path: song.path || '',
                        filename: song.filename || song.path?.split('/').pop() || '',
                        cover: song.cover || '',
                        mood: song.mood || '',
                        uploaded: song.uploaded || ''
                    }));
                
                console.log(`Fetched ${availableSongs.value.length} songs successfully`);
                return true;
            } else {
                console.error('Invalid response from music API:', response);
                return false;
            }
        } catch (error) {
            console.error('Error fetching available songs:', error);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    // Player control methods

    /**
     * Toggles play/pause state of the current song
     */
    const togglePlay = () => {
        if (!audioPlayer.value) return

        // Mark that user has interacted with the player
        userHasInteracted.value = true

        if (audioPlayer.value.paused) {
            audioPlayer.value.play()
                .then(() => { isPlaying.value = true })
                .catch(err => {
                    console.error('Error playing audio:', err)
                    isPlaying.value = false
                })
        } else {
            audioPlayer.value.pause()
            isPlaying.value = false
        }
    }

    /**
     * Gets formatted path for a song based on filename or path
     * @param song The song to get the path for
     * @param forceFormat Optional format to force (e.g., 'mp3', 'ogg')
     * @returns The formatted URL path for the song
     */
    const getSongPath = (song: Song, forceFormat?: string): string => {
        if (!song.path) return '';

        // If path is already properly formatted with /api/ or is a full URL, use it
        if (song.path.startsWith('/api/') || song.path.startsWith('http')) {
            return song.path;
        }

        // Handle paths starting with /music/
        if (song.path.startsWith('/music/')) {
            return `/api${song.path}`;
        }

        // Extract filename from path or use provided filename
        const filename = song.filename || song.path.split('/').pop() || '';
        
        // If format is specified, add it to the URL
        if (forceFormat) {
            return `/api/music/stream?filename=${encodeURIComponent(filename)}&format=${forceFormat}`;
        }
        
        // Default case: use streaming API with filename
        return `/api/music/stream?filename=${encodeURIComponent(filename)}`;
    }

    /**
     * Creates an array of fallback paths to try if primary path fails
     * @param song The song to get fallback paths for
     * @returns Array of paths to try in order
     */
    const getSongFallbackPaths = (song: Song): string[] => {
        const paths: string[] = [];
        const filename = song.filename || song.path.split('/').pop() || '';
        
        // Primary path - default streaming endpoint
        paths.push(getSongPath(song));
        
        // Format-specific paths based on browser support
        if (supportedFormats.mp3) {
            paths.push(getSongPath(song, 'mp3'));
        }
        
        if (supportedFormats.ogg) {
            paths.push(getSongPath(song, 'ogg'));
        }
        
        if (supportedFormats.wav) {
            paths.push(getSongPath(song, 'wav'));
        }
        
        // Legacy paths
        paths.push(
            `/api/music/${encodeURIComponent(filename)}`,
            `/music/${encodeURIComponent(filename)}`,
            `/public/music/${encodeURIComponent(filename)}`
        );
        
        // Filter out duplicates and return
        return [...new Set(paths)];
    }

    /**
     * Attempts to play a song using its path
     * @param path The audio path to play
     * @returns Promise<boolean> true if successful or needs user interaction
     */
    const playSong = async (path: string): Promise<boolean> => {
        if (!audioPlayer.value) return false;
        
        // Reset any previous errors
        formatError.value = false;

        try {
            // Set source and play
            audioPlayer.value.src = path;
            await audioPlayer.value.play();

            isPlaying.value = true;
            return true;
        } catch (err) {
            if (err instanceof Error) {
                switch (err.name) {
                    case 'NotAllowedError':
                        console.warn('Autoplay prevented by browser policy - waiting for user interaction');
                        isPlaying.value = false;
                        return true; // This is a "success" - just needs user interaction
                    
                    case 'AbortError':
                        console.warn('Playback was aborted, likely due to rapid selection changes');
                        break;
                    
                    case 'NotSupportedError':
                        console.error('Format not supported by browser:', path);
                        formatError.value = true;
                        break;
                        
                    default:
                        console.error('Error playing song:', err.name, err.message);
                }
            } else {
                console.error('Unknown error playing song:', err);
            }
            return false;
        }
    }

    /**
     * Flag to track if user has interacted with the page
     * Chrome requires user interaction before allowing autoplay
     */
    const userHasInteracted = ref(false)

    /**
     * Tries alternate paths when primary path fails
     * @param song The song to play
     * @param startIndex Index to start trying from in fallbackPaths array
     * @param maxAttempts Maximum number of paths to try (prevents infinite loops)
     * @returns Promise<boolean> true if any path succeeded
     */
    const tryAlternatePaths = async (song: Song, startIndex = 0, maxAttempts = 3): Promise<boolean> => {
        if (!audioPlayer.value) return false;

        // Reset format error since we're trying new paths
        formatError.value = false;

        // Get fallback paths and limit attempts
        const fallbackPaths = getSongFallbackPaths(song);
        const endIndex = Math.min(fallbackPaths.length, startIndex + maxAttempts);

        // Try each path in sequence
        for (let i = startIndex; i < endIndex; i++) {
            const path = fallbackPaths[i];
            console.log(`Trying fallback path ${i + 1}/${fallbackPaths.length}: ${path}`);

            try {
                // Pause any current playback
                audioPlayer.value.pause();

                // Set new source
                audioPlayer.value.src = path;

                // Handle autoplay restrictions
                if (!userHasInteracted.value) {
                    console.info('User has not interacted with the page yet. Setting up song but not autoplaying.');
                    // Just set the source but don't attempt to play
                    isPlaying.value = false;
                    return true;
                }

                // Try to play
                await audioPlayer.value.play();

                isPlaying.value = true;
                console.log('Successfully playing from fallback path:', path);
                return true;
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError') {
                        console.warn('Autoplay prevented by browser. User must interact with the document first.');
                        isPlaying.value = false;
                        return true; // We found a working path, just need user interaction
                    } else if (err.name === 'AbortError') {
                        console.warn('Playback aborted during fallback sequence, trying next path');
                    } else {
                        console.error(`Fallback path ${i + 1} failed:`, err.name, err.message);
                    }
                } else {
                    console.error(`Unknown error for path ${i + 1}:`, err);
                }
            }
        }

        // If all fallback paths failed, set format error
        formatError.value = true;
        isPlaying.value = false;
        return false;
    }

    /**
     * Selects and plays a song
     * @param song The song to play
     */
    const selectSong = async (song: Song): Promise<void> => {
        if (!song.path || !audioPlayer.value) return;

        // Reset format error state when selecting a new song
        formatError.value = false;
        
        // Update current song state immediately
        currentSong.value = { ...song }; // Clone to avoid reference issues

        // Pause any current playback
        audioPlayer.value.pause();

        // Set up error handler for audio element
        const handleAudioError = () => {
            if (!audioPlayer.value?.error) return;

            const error = audioPlayer.value.error;
            console.error('Audio error occurred:', error.message, 'Code:', error.code);

            // Handle specific error types
            switch (error.code) {
                case MediaError.MEDIA_ERR_ABORTED:
                    console.warn('Playback was aborted');
                    break;

                case MediaError.MEDIA_ERR_NETWORK:
                    console.error('Network error while loading audio');
                    void tryAlternatePaths(song, 0);
                    break;

                case MediaError.MEDIA_ERR_DECODE:
                    console.error('Format error: Audio file might be corrupted or in an unsupported format');
                    // Set format error state
                    formatError.value = true;
                    // Try with a specific streaming URL that might handle format conversion
                    void tryStreamingUrl(song);
                    break;

                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    console.error('Format not supported or file not found');
                    void tryAlternatePaths(song, 0);
                    break;

                default:
                    console.error('Unknown media error, trying alternate paths');
                    void tryAlternatePaths(song, 0);
            }
        };

        // Try to use the streaming API which might handle format conversion
        const tryStreamingUrl = async (songToTry: Song): Promise<boolean> => {
            if (!audioPlayer.value) return false;
            
            try {
                const filename = songToTry.filename || songToTry.path.split('/').pop() || '';
                const streamPath = `/api/music/stream?filename=${encodeURIComponent(filename)}`;
                console.log('Trying streaming path for format error:', streamPath);

                audioPlayer.value.src = streamPath;

                if (userHasInteracted.value) {
                    await audioPlayer.value.play();
                    isPlaying.value = true;
                    formatError.value = false;
                    return true;
                }
                return true; // Successfully set source, waiting for interaction
            } catch (err) {
                console.error('Error with streaming URL:', err);
                // If streaming fails, try alternate paths as a last resort
                return tryAlternatePaths(songToTry, 0);
            }
        };

        // Remove old handlers and add new one
        audioPlayer.value.onerror = null;
        audioPlayer.value.onerror = handleAudioError;

        // Get the primary path for the song
        const primaryPath = getSongPath(song);
        console.log('Selected song:', song.title, 'Path:', primaryPath);

        // Set source
        audioPlayer.value.src = primaryPath;

        // Try to play if user has interacted
        if (userHasInteracted.value) {
            try {
                await audioPlayer.value.play();
                isPlaying.value = true;
                console.log('Playing song:', song.title);
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError') {
                        console.warn('Autoplay prevented by browser policy - waiting for user interaction');
                        isPlaying.value = false;
                    } else if (err.name === 'AbortError') {
                        console.warn('Playback aborted, likely due to another selection');
                    } else {
                        console.error('Error playing song, trying fallback paths:', err);
                        void tryAlternatePaths(song, 0);
                    }
                } else {
                    console.error('Unknown error playing song:', err);
                    void tryAlternatePaths(song, 0);
                }
            }
        } else {
            console.info('Waiting for user interaction before playing');
            isPlaying.value = false;
        }
    }

    /**
     * Plays the previous song in the playlist
     */
    const prevSong = () => {
        if (availableSongs.value.length === 0) return

        const currentIndex = availableSongs.value.findIndex(song => song.path === currentSong.value.path)
        const prevIndex = (currentIndex - 1 + availableSongs.value.length) % availableSongs.value.length
        selectSong(availableSongs.value[prevIndex])
    }

    /**
     * Plays the next song in the playlist
     */
    const nextSong = () => {
        if (availableSongs.value.length === 0) return

        const currentIndex = availableSongs.value.findIndex(song => song.path === currentSong.value.path)
        const nextIndex = (currentIndex + 1) % availableSongs.value.length
        selectSong(availableSongs.value[nextIndex])
    }

    /**
     * Toggles mute/unmute state
     */
    const toggleMute = () => {
        if (!audioPlayer.value) return

        isMuted.value = !isMuted.value
        audioPlayer.value.muted = isMuted.value
    }

    /**
     * Updates volume based on state
     */
    const updateVolume = () => {
        if (!audioPlayer.value) return
        audioPlayer.value.volume = volume.value
    }

    /**
     * Seeks to position in audio track
     */
    const seekAudio = (event: MouseEvent) => {
        if (!audioPlayer.value) return

        const progressBar = event.currentTarget as HTMLElement
        const offsetX = event.clientX - progressBar.getBoundingClientRect().left
        const width = progressBar.offsetWidth
        const seekTime = (offsetX / width) * (audioPlayer.value.duration || 0)

        audioPlayer.value.currentTime = seekTime
    }

    /**
     * Updates progress state as audio plays
     */
    const updateProgress = () => {
        if (!audioPlayer.value) return

        audioProgress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100
    }

    /**
     * Handles music file input change for uploads
     */
    const handleMusicFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        if (input.files && input.files.length > 0) {
            newSong.value.file = input.files[0]
        } else {
            newSong.value.file = null
        }
    }

    /**
     * Uploads a music file
     * @returns {Promise<{success: boolean, message: string}>} Result of the upload operation
     */
    const uploadMusic = async (): Promise<{success: boolean, message: string}> => {
        // Validate inputs
        if (!newSong.value.file) {
            return { success: false, message: 'Please select a music file' };
        }
        
        if (!newSong.value.title) {
            return { success: false, message: 'Please enter a title for the song' };
        }
        
        // Check file type
        const validMusicTypes = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/aac'];
        if (!validMusicTypes.includes(newSong.value.file.type)) {
            return { 
                success: false, 
                message: `Invalid file type: ${newSong.value.file.type}. Please upload a supported audio file (MP3, OGG, WAV, etc.).`
            };
        }
        
        // Size check (max 25MB)
        const maxSize = 25 * 1024 * 1024; // 25MB in bytes
        if (newSong.value.file.size > maxSize) {
            return {
                success: false,
                message: `File is too large (${Math.round(newSong.value.file.size / (1024 * 1024))}MB). Maximum size is 25MB.`
            };
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('file', newSong.value.file);
        formData.append('title', newSong.value.title.trim());
        formData.append('artist', (newSong.value.artist || '').trim());
        formData.append('mood', newSong.value.mood || '');

        try {
            uploadingMusic.value = true;
            const response = await $fetch<ApiResponse>(apiUrls.uploadMusic, {
                method: 'POST',
                body: formData
            });

            if (response?.success) {
                console.log('Music uploaded successfully:', response);
                
                // Reset the form
                newSong.value = {
                    title: '',
                    artist: '',
                    mood: '',
                    file: null
                };
                
                // Refresh the song list
                await fetchAvailableSongs();
                return { success: true, message: 'Music uploaded successfully' };
            } else {
                console.error('Failed to upload music:', response?.message);
                return { 
                    success: false, 
                    message: response?.message || 'Failed to upload music' 
                };
            }
        } catch (error) {
            console.error('Error uploading music:', error);
            return {
                success: false,
                message: `Error uploading music: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        } finally {
            uploadingMusic.value = false;
        }
    }

    /**
     * Filters songs by mood
     */
    const filterSongsByMood = (mood: string) => {
        if (!mood) return availableSongs.value

        return availableSongs.value.filter(song =>
            song.mood?.toLowerCase() === mood.toLowerCase()
        )
    }

    /**
     * Checks if a specific audio format is supported by the browser
     * @param mimeType The MIME type to check (e.g., 'audio/mp3')
     * @returns boolean indicating if the format is supported
     */
    const isAudioFormatSupported = (mimeType: string): boolean => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            // We're on the server, so we can't check
            return false
        }

        const audio = document.createElement('audio')
        return Boolean(audio.canPlayType && audio.canPlayType(mimeType).replace(/no/, ''))
    }

    /**
     * Gets the list of audio formats supported by the browser
     * @returns An object with boolean flags for each format
     */
    const getSupportedFormats = () => {
        return {
            mp3: isAudioFormatSupported('audio/mpeg'),
            ogg: isAudioFormatSupported('audio/ogg; codecs="vorbis"'),
            wav: isAudioFormatSupported('audio/wav; codecs="1"'),
            aac: isAudioFormatSupported('audio/mp4; codecs="mp4a.40.2"'),
            flac: isAudioFormatSupported('audio/flac')
        }
    }

    // Get supported formats on initialization
    const supportedFormats = getSupportedFormats()
    console.log('Browser audio support:', supportedFormats)

    // ==============================
    // LIFECYCLE & WATCHERS
    // ==============================

    /**
     * Sets up listeners for user interaction to help with autoplay
     */
    const setupUserInteractionListeners = () => {
        // Only run in browser context
        if (typeof window === 'undefined') return;
        
        // These are the events that count as user interaction for autoplay policies
        const interactionEvents = [
            'click', 'touchstart', 'touchend', 'keydown', 'pointerdown', 'mousedown'
        ];

        const handleUserInteraction = () => {
            userHasInteracted.value = true;
            console.log('User interaction detected - autoplay should now work');

            // If a song is loaded but not playing due to autoplay restrictions, try playing it now
            if (audioPlayer.value && audioPlayer.value.paused && audioPlayer.value.src &&
                currentSong.value.title && !isPlaying.value) {
                audioPlayer.value.play()
                    .then(() => {
                        isPlaying.value = true;
                        console.log('Auto-starting playback after user interaction');
                    })
                    .catch(err => {
                        console.warn('Failed to auto-start playback:', err);
                    });
            }

            // Remove listeners once we've detected interaction
            interactionEvents.forEach(event => {
                window.removeEventListener(event, handleUserInteraction);
            });
        };

        // Add listeners for user interaction events
        interactionEvents.forEach(event => {
            window.addEventListener(event, handleUserInteraction, { once: true });
        });
        
        // Also check if the browser might already allow autoplay
        const checkAutoplaySupport = async () => {
            try {
                // Create a temporary audio element to test autoplay
                const tempAudio = document.createElement('audio');
                tempAudio.volume = 0; // Mute it
                tempAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'; // Tiny audio sample
                
                // Try to play it
                await tempAudio.play();
                
                // If we get here, autoplay is supported
                console.log('Browser supports autoplay!');
                userHasInteracted.value = true;
                
                // Clean up
                tempAudio.pause();
                tempAudio.remove();
            } catch (err) {
                console.log('Autoplay not supported without user interaction:', err);
                // We'll wait for user interaction
            }
        };
        
        checkAutoplaySupport();
    }

    /**
     * Sets up event listeners for the audio player
     */
    const setupAudioEvents = () => {
        if (!audioPlayer.value) return;
        
        // Clean up any existing listeners
        const player = audioPlayer.value;
        
        // Handle timeupdate event
        player.addEventListener('timeupdate', updateProgress);
        
        // Handle ended event
        player.addEventListener('ended', () => {
            console.log('Song ended, playing next song');
            nextSong();
        });
        
        // Handle play/pause events
        player.addEventListener('play', () => {
            isPlaying.value = true;
        });
        
        player.addEventListener('pause', () => {
            isPlaying.value = false;
        });
        
        // Handle loading events
        player.addEventListener('waiting', () => {
            console.log('Audio is buffering...');
        });
        
        player.addEventListener('canplay', () => {
            console.log('Audio can now be played');
        });
        
        // Handle volume changes
        player.addEventListener('volumechange', () => {
            volume.value = player.volume;
            isMuted.value = player.muted;
        });
    }

    // Watch for changes in audioPlayer to set up event listeners
    watch(audioPlayer, () => {
        setupAudioEvents();
    })

    // Initialize component
    onMounted(() => {
        // Only run browser-specific code in browser environment
        if (typeof window !== 'undefined') {
            // Set up listeners for user interaction to handle autoplay restrictions
            setupUserInteractionListeners();
            
            // Check if the browser allows autoplay using AudioContext
            if (typeof AudioContext !== 'undefined') {
                try {
                    const audioContext = new AudioContext();
                    console.log('AudioContext state:', audioContext.state);
                    
                    if (audioContext.state === 'running') {
                        userHasInteracted.value = true;
                        console.log('AudioContext running - autoplay should work');
                    } else {
                        console.log('AudioContext suspended - autoplay may be restricted');
                        
                        // Setup a one-time listener for resuming the context
                        const resumeContext = () => {
                            audioContext.resume().then(() => {
                                console.log('AudioContext resumed after user interaction');
                            });
                        };
                        
                        ['click', 'touchstart'].forEach(evt => {
                            window.addEventListener(evt, resumeContext, { once: true });
                        });
                    }
                } catch (err) {
                    console.warn('Could not create AudioContext to check autoplay status:', err);
                }
            }
            
            // If the player is already set up, configure its events
            if (audioPlayer.value) {
                setupAudioEvents();
            }
        }

        // Fetch available songs (works both client and server side)
        void fetchAvailableSongs();
    })

    /**
     * Resets the format error state and tries again with the current song
     * Will try alternative formats if available
     */
    const resetFormatError = async (): Promise<void> => {
        formatError.value = false;
        
        if (!currentSong.value.path || !audioPlayer.value) return;
        
        // Try to find a suitable format based on browser support
        if (supportedFormats.mp3 || supportedFormats.ogg || supportedFormats.wav) {
            const filename = currentSong.value.filename || currentSong.value.path.split('/').pop() || '';
            
            // Try with a format that's definitely supported by the browser
            let formatToTry = '';
            if (supportedFormats.mp3) formatToTry = 'mp3';
            else if (supportedFormats.ogg) formatToTry = 'ogg';
            else if (supportedFormats.wav) formatToTry = 'wav';
            
            if (formatToTry) {
                const formatSpecificPath = `/api/music/stream?filename=${encodeURIComponent(filename)}&format=${formatToTry}`;
                console.log(`Trying format-specific path: ${formatSpecificPath}`);
                
                try {
                    audioPlayer.value.src = formatSpecificPath;
                    if (userHasInteracted.value) {
                        await audioPlayer.value.play();
                        isPlaying.value = true;
                        return;
                    }
                } catch (err) {
                    console.error(`Error with ${formatToTry} format:`, err);
                }
            }
        }
        
        // If format-specific attempt fails, try regular select
        selectSong(currentSong.value);
    }

    // Return composable API
    return {
        // Player state
        audioPlayer,
        currentSong,
        isPlaying,
        isMuted,
        volume,
        audioProgress,
        userHasInteracted,
        formatError,
        supportedFormats,

        // Library state
        availableSongs,
        isLoading,

        // Upload state
        uploadingMusic,
        newSong,

        // Player control methods
        setAudioPlayer,
        togglePlay,
        selectSong,
        prevSong,
        nextSong,
        toggleMute,
        updateVolume,
        seekAudio,
        updateProgress,
        resetFormatError,

        // Song management methods
        fetchAvailableSongs,
        filterSongsByMood,

        // Upload methods
        handleMusicFileChange,
        uploadMusic
    }
}
