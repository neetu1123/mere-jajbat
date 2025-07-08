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

    // Track retry attempts to prevent infinite loops
    const retryAttempts = ref(0);
    const maxRetryAttempts = 3;
    const attemptedPaths = ref<Set<string>>(new Set());

    /**
     * Reset retry tracking when selecting a new song
     */
    const resetRetryTracking = () => {
        retryAttempts.value = 0;
        attemptedPaths.value = new Set();
    };

    /**
     * Checks if we should attempt to retry with alternate paths
     * @param song The current song
     * @returns boolean indicating if we should retry
     */
    const shouldAttemptRetry = (song: Song): boolean => {
        // Don't retry if we've reached the maximum attempts
        if (retryAttempts.value >= maxRetryAttempts) {
            console.warn(`Max retry attempts (${maxRetryAttempts}) reached for song: ${song.title}`);
            return false;
        }

        // Don't retry if the song doesn't have a path
        if (!song.path) {
            console.warn('No path available for retry');
            return false;
        }

        // Increment retry counter
        retryAttempts.value++;
        return true;
    };

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
    const tryAlternatePaths = async (song: Song, startIndex = 0, maxAttempts = 4): Promise<boolean> => {
        if (!audioPlayer.value) return false;

        // Don't try if we've exceeded max retry attempts
        if (retryAttempts.value >= maxRetryAttempts) {
            console.warn(`Max retry attempts (${maxRetryAttempts}) reached for song: ${song.title}`);
            formatError.value = true;
            isPlaying.value = false;
            return false;
        }

        // Reset format error since we're trying new paths
        formatError.value = false;

        // Get fallback paths and add explicit format conversions
        const fallbackPaths = getSongFallbackPaths(song);

        // Try specific formats using query parameters to force transcoding on server
        const filename = song.filename || song.path.split('/').pop() || '';
        const additionalPaths = [
            `/api/music/stream?filename=${encodeURIComponent(filename)}&format=mp3&forceTranscode=true`,
            `/api/music/stream?filename=${encodeURIComponent(filename)}&format=wav&forceTranscode=true`,
            `/api/music/stream?filename=${encodeURIComponent(filename)}&format=ogg&forceTranscode=true`
        ];

        // Combine all paths, ensuring no duplicates
        const allPaths = [...new Set([...additionalPaths, ...fallbackPaths])];

        // Filter out paths we've already tried
        const untried = allPaths.filter(path => !attemptedPaths.value.has(path));

        if (untried.length === 0) {
            console.warn('All paths have been tried and failed');
            formatError.value = true;
            isPlaying.value = false;
            return false;
        }

        // Only try a subset of paths at a time
        const endIndex = Math.min(untried.length, startIndex + maxAttempts);

        // Before trying paths, ensure the audio element is in a clean state
        audioPlayer.value.pause();
        audioPlayer.value.currentTime = 0;
        audioPlayer.value.src = '';

        // Small delay to ensure reset
        await new Promise(resolve => setTimeout(resolve, 100));

        // Try each path in sequence
        for (let i = startIndex; i < endIndex; i++) {
            const path = untried[i];
            // Mark this path as attempted so we don't try it again
            attemptedPaths.value.add(path);
            console.log(`Trying path ${i + 1}/${untried.length} (retry attempt ${retryAttempts.value}): ${path}`);

            try {
                // Use a timeout promise to detect if the audio takes too long to load
                const loadPromise = new Promise<boolean>((resolve, reject) => {
                    if (!audioPlayer.value) return reject(new Error('No audio player'));

                    const canPlayHandler = () => {
                        resolve(true);
                        cleanup();
                    };

                    const errorHandler = (e: Event) => {
                        reject(new Error(`Audio error: ${audioPlayer.value?.error?.code || 'unknown'}`));
                        cleanup();
                    };

                    const timeoutId = setTimeout(() => {
                        reject(new Error('Loading timeout'));
                        cleanup();
                    }, 5000);

                    const cleanup = () => {
                        audioPlayer.value?.removeEventListener('canplay', canPlayHandler);
                        audioPlayer.value?.removeEventListener('error', errorHandler);
                        clearTimeout(timeoutId);
                    };

                    audioPlayer.value.addEventListener('canplay', canPlayHandler, { once: true });
                    audioPlayer.value.addEventListener('error', errorHandler, { once: true });
                });

                // Set new source
                audioPlayer.value.src = path;
                audioPlayer.value.load(); // Explicitly load to ensure source is loaded

                // Wait for can-play or timeout
                await loadPromise;

                // If we get here, the format can be played
                console.log(`Path ${path} can be played!`);

                // Handle autoplay restrictions
                if (!userHasInteracted.value) {
                    console.info('User has not interacted with the page yet. Source is ready but not playing.');
                    // Just set the source but don't attempt to play
                    isPlaying.value = false;
                    return true;
                }

                // Try to play
                await audioPlayer.value.play();

                isPlaying.value = true;
                formatError.value = false;
                console.log('Successfully playing from path:', path);
                return true;
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError' || err.message.includes('NotAllowedError')) {
                        console.warn('Autoplay prevented by browser. User must interact with the document first.');
                        isPlaying.value = false;
                        return true; // We found a working path, just need user interaction
                    } else if (err.name === 'AbortError' || err.message.includes('AbortError')) {
                        console.warn('Playback aborted during path sequence, trying next path');
                    } else {
                        console.error(`Path ${i + 1} failed:`, err.name || 'Error', err.message);
                    }
                } else {
                    console.error(`Unknown error for path ${i + 1}:`, err);
                }
            }
        }

        // If all paths failed, set format error
        formatError.value = true;
        isPlaying.value = false;
        console.error('All paths failed for song:', song.title);
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

        // Reset retry tracking for the new song
        resetRetryTracking();

        // Update current song state immediately
        currentSong.value = { ...song }; // Clone to avoid reference issues

        // Pause any current playback
        audioPlayer.value.pause();

        // Set up error handler for audio element
        const handleAudioError = () => {
            if (!audioPlayer.value?.error) return;

            // Check for empty source which can cause infinite error loops
            if (audioPlayer.value.src === '' || audioPlayer.value.src === 'about:blank') {
                console.warn('Empty source detected in error handler, preventing retry loop');
                formatError.value = true;
                return;
            }

            const error = audioPlayer.value.error;
            console.error('Audio error occurred:', error.message, 'Code:', error.code);

            // Handle specific error types
            switch (error.code) {
                case MediaError.MEDIA_ERR_ABORTED:
                    console.warn('Playback was aborted');
                    break;

                case MediaError.MEDIA_ERR_NETWORK:
                    console.error('Network error while loading audio');
                    if (shouldAttemptRetry(song)) {
                        void tryAlternatePaths(song, 0);
                    }
                    break;

                case MediaError.MEDIA_ERR_DECODE:
                    console.error('Format error: Audio file might be corrupted or in an unsupported format');
                    // Set format error state
                    formatError.value = true;
                    // Try with a format conversion approach if we haven't exceeded retry attempts
                    if (shouldAttemptRetry(song)) {
                        void tryAlternatePaths(song, 0);
                    }
                    break;

                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    console.error('Format not supported or file not found');
                    if (shouldAttemptRetry(song)) {
                        void tryAlternatePaths(song, 0);
                    }
                    break;

                default:
                    console.error('Unknown media error, trying alternate paths');
                    if (shouldAttemptRetry(song)) {
                        void tryAlternatePaths(song, 0);
                    }
            }
        };

        // tryStreamingUrl is now defined at composable scope

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
     * Added additional validation for audio file types
     */
    const handleMusicFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Validate file extension regardless of MIME type
            const fileName = file.name.toLowerCase();
            const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'];
            const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

            if (hasValidExtension) {
                newSong.value.file = file;

                // For debugging
                console.log(`File accepted: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
            } else {
                console.error(`Invalid file extension: ${fileName}. Please use MP3, WAV, OGG, AAC, or M4A files.`);
                newSong.value.file = null;

                // Alert the user - you might want to handle this more elegantly in your UI
                alert(`Invalid file extension. Please use MP3, WAV, OGG, AAC, or M4A files.`);
            }
        } else {
            newSong.value.file = null;
        }
    }

    /**
     * Uploads a music file
     * @returns {Promise<{success: boolean, message: string}>} Result of the upload operation
     */
    const uploadMusic = async (): Promise<{ success: boolean, message: string }> => {
        // Validate inputs
        if (!newSong.value.file) {
            return { success: false, message: 'Please select a music file' };
        }

        if (!newSong.value.title) {
            return { success: false, message: 'Please enter a title for the song' };
        }

        // Check file type, but also verify by extension since MIME types can be unreliable
        const validMusicTypes = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/mp4'];
        const fileName = newSong.value.file.name.toLowerCase();
        const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

        // Accept if either MIME type OR file extension is valid (browsers sometimes report incorrect MIME types)
        if (!validMusicTypes.includes(newSong.value.file.type) && !hasValidExtension) {
            console.warn(`File MIME type check failed: ${newSong.value.file.type}, filename: ${fileName}`);
            return {
                success: false,
                message: `This doesn't appear to be a supported audio file. Please upload MP3, OGG, WAV, AAC, or M4A files.`
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
     * Enhanced with better error and stalled detection
     */
    const setupAudioEvents = () => {
        if (!audioPlayer.value) return;

        // Clear any existing event listeners by cloning and replacing the audio element
        // This is a clean way to remove all previous listeners
        if (audioPlayer.value.parentNode) {
            const newAudio = document.createElement('audio');
            // Copy all attributes
            Array.from(audioPlayer.value.attributes).forEach(attr => {
                newAudio.setAttribute(attr.name, attr.value);
            });
            audioPlayer.value.parentNode.replaceChild(newAudio, audioPlayer.value);
            audioPlayer.value = newAudio;
        }

        const player = audioPlayer.value;

        // Track loading state to detect stalled streams
        let isLoading = false;
        let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

        const startLoadingTimer = function () {
            isLoading = true;
            // Clear any existing timeout
            if (loadingTimeout) clearTimeout(loadingTimeout);

            // Set a new timeout - if we're still loading after 10 seconds, we might be stalled
            loadingTimeout = setTimeout(() => {
                if (isLoading && audioPlayer.value) {
                    console.warn("Audio loading stalled - attempting to recover");
                    formatError.value = true;

                    // If we have a current song, try with alternative paths
                    if (currentSong.value.path && shouldAttemptRetry(currentSong.value)) {
                        void tryAlternatePaths(currentSong.value, 0);
                    }
                }
            }, 10000); // 10 seconds timeout
        };

        const clearLoadingTimer = () => {
            isLoading = false;
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
        };

        // Handle timeupdate event
        player.addEventListener('timeupdate', updateProgress);

        // Handle ended event
        player.addEventListener('ended', () => {
            console.log('Song ended, playing next song');
            clearLoadingTimer();
            nextSong();
        });

        // Handle play/pause events
        player.addEventListener('play', () => {
            isPlaying.value = true;
        });

        player.addEventListener('pause', () => {
            isPlaying.value = false;
            clearLoadingTimer(); // Clear timer when paused
        });

        // Handle loading events
        player.addEventListener('waiting', () => {
            console.log('Audio is buffering...');
            startLoadingTimer(); // Start stall detection timer
        });

        player.addEventListener('canplay', () => {
            console.log('Audio can now be played');
            clearLoadingTimer(); // Cancel stall timer
            formatError.value = false; // Clear any format errors
        });

        player.addEventListener('canplaythrough', () => {
            console.log('Audio can play through without buffering');
            clearLoadingTimer(); // Cancel stall timer
        });

        // Handle error events better
        player.addEventListener('error', () => {
            clearLoadingTimer(); // Clear loading timer on error
            const error = player.error;

            // Check for empty source which can cause infinite error loops
            if (player.src === '' || player.src === 'about:blank') {
                console.warn('Empty source detected in error handler, preventing retry loop');
                formatError.value = true;
                return;
            }

            if (error) {
                console.error(`Audio error: ${error.code} - ${error.message}`);

                // Provide more descriptive messages based on error code
                switch (error.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        console.log('Playback aborted by user');
                        break;

                    case MediaError.MEDIA_ERR_NETWORK:
                        console.error('Network error while loading audio');
                        formatError.value = true;
                        // Try alternative paths if we should still retry
                        if (currentSong.value.path && shouldAttemptRetry(currentSong.value)) {
                            void tryAlternatePaths(currentSong.value, 0);
                        }
                        break;

                    case MediaError.MEDIA_ERR_DECODE:
                        console.error('Format error: Audio file might be corrupted or in an unsupported format');
                        formatError.value = true;
                        // Try alternative paths if we should still retry
                        if (currentSong.value.path && shouldAttemptRetry(currentSong.value)) {
                            void tryAlternatePaths(currentSong.value, 0);
                        }
                        break;

                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        console.error('Format not supported or file not found');
                        formatError.value = true;
                        // Try alternative paths if we should still retry
                        if (currentSong.value.path && shouldAttemptRetry(currentSong.value)) {
                            void tryAlternatePaths(currentSong.value, 0);
                        }
                        break;
                }
            }
        });

        // Handle volume changes
        player.addEventListener('volumechange', () => {
            volume.value = player.volume;
            isMuted.value = player.muted;
        });

        // Handle stalled event
        player.addEventListener('stalled', () => {
            console.warn('Audio playback has stalled');
            startLoadingTimer(); // Start stall detection
        });

        // Monitor for progress to detect if we're actually getting data
        let lastLoadedProgress = 0;
        let progressStallCount = 0;

        player.addEventListener('progress', () => {
            if (player.buffered.length > 0) {
                const bufferedEnd = player.buffered.end(player.buffered.length - 1);

                // If buffering hasn't progressed, increment stall counter
                if (bufferedEnd === lastLoadedProgress) {
                    progressStallCount++;

                    // If we've stalled for several progress events, we might have a problem
                    if (progressStallCount > 5) {
                        console.warn('Buffer progress appears stalled');
                        formatError.value = true;

                        // Try recovery if we've stalled too long
                        if (progressStallCount > 10 && currentSong.value.path && shouldAttemptRetry(currentSong.value)) {
                            void tryAlternatePaths(currentSong.value, 0);
                            progressStallCount = 0;
                        }
                    }
                } else {
                    // Reset stall counter if we're making progress
                    progressStallCount = 0;
                    lastLoadedProgress = bufferedEnd;
                }
            }
        });
    }

    // Watch for changes in audioPlayer to set up event listeners
    watch(audioPlayer, (player) => {
        if (player) {
            setupAudioEvents();
        }
    });

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

        // Reset retry counters for a fresh start
        resetRetryTracking();

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
                    // Make sure the audio element is in a clean state first
                    audioPlayer.value.pause();
                    audioPlayer.value.currentTime = 0;
                    audioPlayer.value.src = '';
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Now try the new format
                    audioPlayer.value.src = formatSpecificPath;
                    await audioPlayer.value.load(); // Explicitly load the source

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

    /**
     * Try to use the streaming API which might handle format conversion
     * @param songToTry The song to attempt streaming
     * @returns Promise<boolean> true if successful
     */
    const tryStreamingUrl = async (songToTry: Song): Promise<boolean> => {
        if (!audioPlayer.value) return false;

        // Track the attempts and format we're trying
        let attemptCount = 0;
        const attemptFormats = ['mp3', 'wav', 'ogg', ''];

        for (const format of attemptFormats) {
            attemptCount++;
            try {
                const filename = songToTry.filename || songToTry.path.split('/').pop() || '';
                let streamPath = `/api/music/stream?filename=${encodeURIComponent(filename)}`;

                // Add format parameter if specified
                if (format) {
                    streamPath += `&format=${format}`;
                }

                console.log(`[Attempt ${attemptCount}] Trying streaming path with format=${format || 'auto'}:`, streamPath);

                // Cancel any pending operations
                audioPlayer.value.pause();

                // Clear any previous error handlers temporarily
                const originalErrorHandler = audioPlayer.value.onerror;
                audioPlayer.value.onerror = null;

                // Set source with a clean slate
                audioPlayer.value.src = '';
                await new Promise(r => setTimeout(r, 50)); // Short delay to reset player state
                audioPlayer.value.src = streamPath;

                // Create a timeout promise to detect stalled loading
                const timeoutPromise = new Promise<boolean>((_, reject) => {
                    setTimeout(() => reject(new Error("Loading timeout")), 5000);
                });

                // Create a can-play promise
                const canPlayPromise = new Promise<boolean>((resolve) => {
                    const canPlayHandler = () => {
                        console.log(`Format ${format || 'auto'} can be played!`);
                        audioPlayer.value?.removeEventListener('canplay', canPlayHandler);
                        resolve(true);
                    };
                    audioPlayer.value!.addEventListener('canplay', canPlayHandler, { once: true });
                });

                // Wait for either canplay or timeout
                const canPlay = await Promise.race([canPlayPromise, timeoutPromise])
                    .catch(err => {
                        console.warn(`Timeout or error waiting for format ${format || 'auto'}:`, err);
                        return false;
                    });

                if (canPlay) {
                    // Restore error handler
                    audioPlayer.value.onerror = originalErrorHandler;

                    // If we can play it and user has interacted, start playback
                    if (userHasInteracted.value) {
                        await audioPlayer.value.play();
                        isPlaying.value = true;
                        formatError.value = false;
                        return true;
                    }
                    return true; // Successfully set source, waiting for interaction
                }

                // If we couldn't play it, continue to the next format
            } catch (err) {
                console.error(`Error with streaming URL format=${format || 'auto'}:`, err);
                // Continue to next format
            }
        }

        // If all streaming attempts failed, try fallback paths as a last resort
        return tryAlternatePaths(songToTry, 0);
    };

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

        // Player initialization and setup
        setAudioPlayer,
        setupAudioEvents,

        // Player control methods
        togglePlay,
        selectSong,
        prevSong,
        nextSong,
        toggleMute,
        updateVolume,
        seekAudio,
        updateProgress,
        resetFormatError,
        playSong,

        // Song management methods
        fetchAvailableSongs,
        filterSongsByMood,
        getSongPath,

        // Upload methods
        handleMusicFileChange,
        uploadMusic
    }
}
