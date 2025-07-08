import { defineEventHandler, readBody } from 'h3'
import { ensureDataFile, readShayariData, writeShayariData, Shayari } from './utils'

/**
 * PATCH /api/shayari/[id]
 * Update an existing shayari entry
 */
export default defineEventHandler(async (event) => {
    try {
        const id = event.context.params?.id

        if (!id) {
            return {
                success: false,
                message: 'Shayari ID is required'
            }
        }

        console.log(`PATCH /api/shayari/${id} - Updating entry`)

        // Make sure the data file is ready
        if (!ensureDataFile()) {
            return {
                success: false,
                message: 'Could not ensure data file exists and is valid'
            }
        }

        const body = await readBody(event)
        console.log('Request body:', body)

        // Read existing data
        const data = readShayariData()

        // Find the shayari to update
        const index = data.findIndex((item: Shayari) => item.id === id)

        if (index === -1) {
            return {
                success: false,
                message: `Shayari with ID ${id} not found`
            }
        }

        // Update the shayari fields while keeping original data where not provided
        const updatedShayari: Shayari = {
            ...data[index],
            text: body.text ?? data[index].text,
            mood: body.mood ?? data[index].mood,
            author: body.author ?? data[index].author,
            imagePath: body.imagePath ?? data[index].imagePath
            // We don't update id or date
        }

        // Replace the old entry with the updated one
        data[index] = updatedShayari

        // Write updated data to file
        if (!writeShayariData(data)) {
            return {
                success: false,
                message: 'Failed to write updated data to file'
            }
        }

        console.log(`Successfully updated shayari with ID: ${id}`)
        return {
            success: true,
            data: updatedShayari,
            message: 'Shayari updated successfully'
        }
    } catch (error: any) {
        console.error('Error updating shayari:', error)
        return {
            success: false,
            message: `Failed to update shayari: ${error.message || 'Unknown error'}`,
            error: error.toString()
        }
    }
})
