import type { UseFetchOptions } from 'nuxt/app'

// Types for Shayari data
export interface Shayari {
    id: string
    text: string
    mood: string
    author: string
    date: string
    imagePath: string | null
}

// Type for creating a new Shayari
export interface CreateShayariPayload {
    text: string
    mood: string
    author?: string
    imagePath?: string | null
}

// Type for updating a Shayari
export interface UpdateShayariPayload {
    text?: string
    mood?: string
    author?: string
    imagePath?: string | null
}

// Response types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export const useShayariApi = () => {
    const config = useRuntimeConfig()

    // Default fetch options with error handling
    const defaultOptions: UseFetchOptions<any> = {
        // Handle errors consistently
        onResponseError: (error) => {
            console.error('API response error:', error)
        }
    }

    // POST: Create a new Shayari
    const createShayari = async (payload: CreateShayariPayload) => {
        return await useFetch<ApiResponse<Shayari>>('/api/shayari', {
            method: 'POST',
            body: payload,
            ...defaultOptions
        })
    }

    // DELETE: Delete a Shayari
    const deleteShayari = async (id: string) => {
        return await useFetch<ApiResponse<void>>('/api/shayari', {
            method: 'DELETE',
            body: { id },
            ...defaultOptions
        })
    }

    // PATCH: Update a Shayari
    const updateShayari = async (id: string, payload: UpdateShayariPayload) => {
        return await useFetch<ApiResponse<Shayari>>(`/api/shayari/${id}`, {
            method: 'PATCH',
            body: payload,
            ...defaultOptions
        })
    }

    // GET methods are provided to be used directly in components with useAsyncData
    // These are the base URLs that should be used with useAsyncData in components

    const apiUrls = {
        // Get all shayari
        getAllShayari: '/api/shayari',

        // Get a single shayari by ID
        getShayariById: (id: string) => `/api/shayari/${id}`,

        // Search shayari by mood and/or text
        searchShayari: (params: { mood?: string, text?: string }) => {
            const queryParams = new URLSearchParams()
            if (params.mood) queryParams.append('mood', params.mood)
            if (params.text) queryParams.append('text', params.text)
            return `/api/shayari/search?${queryParams.toString()}`
        },

        // Get shayari statistics
        getShayariStats: '/api/shayari/stats'
    }

    return {
        // Mutation methods (POST, DELETE, PATCH)
        createShayari,
        deleteShayari,
        updateShayari,

        // API URLs for use with useAsyncData in components
        apiUrls
    }
}
