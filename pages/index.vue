<template>
    <div class="shayari-page container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">Shayari Collection</h1>

        <!-- Filtering options -->
        <div class="flex flex-wrap gap-4 mb-6">
            <div class="flex-1 min-w-[250px]">
                <label class="block text-sm font-medium mb-1">Filter by Mood</label>
                <select v-model="moodFilter"
                    class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring focus:ring-pink-200">
                    <option value="">All Moods</option>
                    <option value="happy">Happy</option>
                    <option value="sad">Sad</option>
                    <option value="love">Love</option>
                    <option value="inspiration">Inspiration</option>
                    <option value="nature">Nature</option>
                    <option value="nostalgia">Nostalgia</option>
                </select>
            </div>

            <div class="flex-1 min-w-[250px]">
                <label class="block text-sm font-medium mb-1">Search Shayari</label>
                <input v-model="searchText" type="text" placeholder="Search by text or author..."
                    class="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring focus:ring-pink-200" />
            </div>
        </div>

        <!-- Shayari statistics -->
        <div v-if="stats" class="mb-6 p-4 bg-pink-50 dark:bg-gray-800 rounded-lg">
            <h2 class="text-xl font-semibold mb-2">Shayari Statistics</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <span class="font-medium">Total Shayaris:</span> {{ stats.totalCount }}
                </div>
                <div>
                    <span class="font-medium">Unique Authors:</span> {{ Object.keys(stats.authorCounts).length }}
                </div>
                <div>
                    <span class="font-medium">Most Popular Mood:</span> {{ getMostPopularMood() }}
                </div>
            </div>
        </div>

        <!-- Add new shayari section -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold mb-4">Add New Shayari</h2>
            <ShayariForm />
        </div>

        <!-- Shayari list section -->
        <div>
            <h2 class="text-2xl font-bold mb-4">Browse Shayaris</h2>

            <div v-if="isPending" class="py-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4">
                </div>
                <p>Loading shayaris...</p>
            </div>

            <div v-else-if="error" class="py-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p class="text-red-600 dark:text-red-400">{{ error }}</p>
                <button @click="refreshData" class="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md">
                    Try Again
                </button>
            </div>

            <div v-else-if="shayariList.length === 0" class="py-8 text-center">
                <p>No shayaris found. Add your first one!</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="shayari in shayariList" :key="shayari.id"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="p-5">
                        <div class="mb-4">
                            <span class="inline-block px-3 py-1 text-sm rounded-full"
                                :class="getMoodClass(shayari.mood)">
                                {{ shayari.mood }}
                            </span>
                        </div>
                        <p class="font-['Kalam'] text-lg mb-4">{{ shayari.text }}</p>
                        <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>- {{ shayari.author }}</span>
                            <span>{{ formatDate(shayari.date) }}</span>
                        </div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3 flex justify-end gap-2">
                        <button @click="deleteCurrentShayari(shayari.id)" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

// Get composable methods and data
const { apiUrls, deleteShayari } = useShayariApi()

// Filters
const moodFilter = ref('')
const searchText = ref('')

// Key for useAsyncData - will change when filters change to trigger refetch
const dataKey = computed(() => `shayari-list-${moodFilter.value}-${searchText.value}`)

// Get the correct API URL based on filters
const apiUrl = computed(() => {
    if (moodFilter.value || searchText.value) {
        return apiUrls.searchShayari({
            mood: moodFilter.value,
            text: searchText.value
        })
    }
    return apiUrls.getAllShayari
})

// Fetch shayari list with SSR support
const { data, pending: isPending, error, refresh: refreshData } = useAsyncData(
    dataKey.value,
    () => $fetch(apiUrl.value),
    { watch: [moodFilter, searchText] }
)

// Extract shayari list from response
const shayariList = computed<Shayari[]>(() => {
    if (Array.isArray(data.value)) {
        return data.value
    }
    return data.value?.data || []
})

// Fetch statistics
const { data: statsData } = useAsyncData(
    'shayari-stats',
    () => $fetch(apiUrls.getShayariStats),
    { server: true }
)

// Extract stats from response
const stats = computed(() => statsData.value?.data)

// Format date for display
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date)
    } catch {
        return dateString
    }
}

// Get CSS class for mood tag
const getMoodClass = (mood: string) => {
    const moodClasses: Record<string, string> = {
        happy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        sad: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        love: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        inspiration: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        nature: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        nostalgia: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    }

    return moodClasses[mood] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Get most popular mood from stats
const getMostPopularMood = () => {
    if (!stats.value?.moodCounts) return 'None'

    let maxCount = 0
    let mostPopularMood = 'None'

    for (const [mood, count] of Object.entries(stats.value.moodCounts)) {
        if (count > maxCount) {
            maxCount = count as number
            mostPopularMood = mood
        }
    }

    return mostPopularMood
}

// Delete a shayari
const deleteCurrentShayari = async (id: string) => {
    if (confirm('Are you sure you want to delete this shayari?')) {
        const result = await deleteShayari(id)
        if (result) {
            refreshData()
        }
    }
}

// Initial data fetch
onMounted(() => {
    refreshData()
})
</script>

<style scoped>
.shayari-page {
    max-width: 1200px;
}

/* Animation for loading spinner */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
