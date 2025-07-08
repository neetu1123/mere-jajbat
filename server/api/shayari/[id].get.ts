import { defineEventHandler } from 'h3'
import { readShayariData, Shayari } from './utils'

/**
 * GET /api/shayari/[id]
 * Get a single shayari entry by ID
 */
export default defineEventHandler((event) => {
    const id = event.context.params?.id

    if (!id) {
        return {
            success: false,
            message: 'Shayari ID is required'
        }
    }

    console.log(`GET /api/shayari/${id} - Retrieving entry`)

    const data = readShayariData()
    const shayari = data.find((item: Shayari) => item.id === id)

    if (!shayari) {
        return {
            success: false,
            message: `Shayari with ID ${id} not found`
        }
    }

    return {
        success: true,
        data: shayari
    }
})
