<template>
    <div class="shayari-list-container">
        <!-- Loading state -->
        <div v-if="pending" class="loading-container">
            <p>Loading shayari entries...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
            <p>Error loading shayari entries: {{ error }}</p>
            <button @click="refresh" class="retry-button">
                Retry
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!shayariList || shayariList.length === 0" class="empty-container">
            <p>No shayari entries found.</p>
        </div>

        <!-- Display shayari list -->
        <div v-else class="shayari-grid">
            <div v-for="shayari in shayariList" :key="shayari.id" class="shayari-card">
                <div class="mood-tag" :class="shayari.mood">{{ shayari.mood }}</div>
                <div class="shayari-content">
                    <p class="shayari-text">{{ shayari.text }}</p>
                    <div class="shayari-meta">
                        <span class="author">{{ shayari.author }}</span>
                        <span class="date">{{ formatDate(shayari.date) }}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button @click="onEdit(shayari)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button @click="onDelete(shayari.id)" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useShayariApi, type Shayari } from '~/composables/useShayariApi'

// Props for optional filtering
const props = defineProps({
    moodFilter: {
        type: String,
        default: ''
    },
    textFilter: {
        type: String,
        default: ''
    }
})

// Emit events
const emit = defineEmits(['edit', 'deleted', 'refresh'])

// Get API utilities from our composable
const { apiUrls, deleteShayari } = useShayariApi()

// If we have filters, use the search endpoint, otherwise use the getAll endpoint
const getApiUrl = computed(() => {
    if (props.moodFilter || props.textFilter) {
        return apiUrls.searchShayari({
            mood: props.moodFilter,
            text: props.textFilter
        })
    }
    return apiUrls.getAllShayari
})

// Use useAsyncData for SSR compatible data fetching
const {
    data: response,
    pending,
    error,
    refresh
} = useAsyncData(
    // Key that changes when the filters change
    () => `shayari-list-${props.moodFilter}-${props.textFilter}`,
    // Fetch function
    () => $fetch(getApiUrl.value),
    {
        // Refresh when props change
        watch: [() => props.moodFilter, () => props.textFilter],
        // Additional options
        server: true,
        lazy: false
    }
)

// Extract the shayari list from the response
const shayariList = computed(() => {
    // If the response is an array, return it directly (for getAllShayari endpoint)
    if (Array.isArray(response.value)) {
        return response.value
    }
    // Otherwise, extract the data array from the response (for search endpoint)
    return response.value?.data || []
})

// Format date for display
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    } catch (e) {
        return dateString
    }
}

// Edit handler
const onEdit = (shayari: Shayari) => {
    emit('edit', shayari)
}

// Delete handler
const onDelete = async (id: string) => {
    try {
        const { data } = await deleteShayari(id)

        if (data.value?.success) {
            // Refresh the list after successful deletion
            refresh()
            emit('deleted', id)
        } else {
            console.error('Failed to delete:', data.value?.message)
        }
    } catch (err) {
        console.error('Error during delete operation:', err)
    }
}

// Refresh data when component mounts
onMounted(() => {
    refresh()
})
</script>

<style scoped>
.shayari-list-container {
    width: 100%;
    padding: 20px 0;
}

.loading-container,
.error-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    width: 100%;
    text-align: center;
}

.retry-button {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.shayari-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    width: 100%;
}

.shayari-card {
    position: relative;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shayari-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.dark .shayari-card {
    background-color: #2d3748;
    color: #e2e8f0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.mood-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: white;
}

.mood-tag.happy {
    background-color: #10b981;
}

.mood-tag.sad {
    background-color: #6b7280;
}

.mood-tag.love {
    background-color: #ec4899;
}

.mood-tag.nature {
    background-color: #059669;
}

.mood-tag.nostalgia {
    background-color: #8b5cf6;
}

.mood-tag.inspiration {
    background-color: #f59e0b;
}

.shayari-content {
    padding: 20px;
}

.shayari-text {
    font-family: 'Kalam', cursive;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 15px;
}

.shayari-meta {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #6b7280;
}

.dark .shayari-meta {
    color: #9ca3af;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
    padding: 10px 20px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.dark .card-actions {
    background-color: #1e293b;
    border-top: 1px solid #334155;
}

.card-actions button {
    background-color: transparent;
    border: none;
    padding: 6px 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.card-actions button:hover {
    background-color: #f1f5f9;
}

.dark .card-actions button:hover {
    background-color: #334155;
}

.edit-btn {
    color: #3b82f6;
    margin-right: 8px;
}

.delete-btn {
    color: #ef4444;
}
</style>
