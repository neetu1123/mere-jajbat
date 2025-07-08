import { defineEventHandler, readBody } from 'h3'
import { ensureDataFile, readShayariData, writeShayariData } from './utils'

/**
 * DELETE /api/shayari
 * Delete a shayari entry by ID
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('DELETE /api/shayari - Received request')

        // Ensure data file exists and is valid
        if (!ensureDataFile()) {
            return {
                success: false,
                message: 'Could not ensure data file exists and is valid'
            }
        }

        const body = await readBody(event)
        const { id } = body

        if (!id) {
            return {
                success: false,
                message: 'Shayari ID is required'
            }
        }

        // Read existing data
        const data = readShayariData()

        if (!Array.isArray(data)) {
            console.error('Data is not an array when trying to delete')
            return {
                success: false,
                message: 'Data structure is invalid'
            }
        }

        // Filter out the entry to delete
        const newData = data.filter((item) => item.id !== id)

        // Check if item was found and deleted
        if (newData.length === data.length) {
            return {
                success: false,
                message: `Shayari with ID ${id} not found`
            }
        }

        // Write back to file
        if (!writeShayariData(newData)) {
            return {
                success: false,
                message: 'Failed to write updated data to file'
            }
        }

        console.log(`Successfully deleted shayari with ID: ${id}`)
        return {
            success: true,
            message: 'Shayari deleted successfully'
        }
    } catch (error: any) {
        console.error('Error deleting shayari:', error)
        return {
            success: false,
            message: `Failed to delete shayari: ${error.message || 'Unknown error'}`
        }
    }
})
