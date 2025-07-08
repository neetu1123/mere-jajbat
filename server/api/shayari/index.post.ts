import { defineEventHandler, readBody } from 'h3'
import { ensureDataFile, readShayariData, writeShayariData, Shayari } from './utils'

/**
 * POST /api/shayari
 * Add a new shayari entry
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('POST /api/shayari - Received request')

        // Make sure the data file is ready
        if (!ensureDataFile()) {
            return {
                success: false,
                message: 'Could not ensure data file exists and is valid'
            }
        }

        const body = await readBody(event)
        console.log('Request body:', body)

        // Validate required fields
        if (!body.text || !body.mood) {
            console.error('Missing required fields: text or mood')
            return {
                success: false,
                message: 'Shayari text and mood are required'
            }
        }

        const newShayari: Shayari = {
            id: Date.now().toString(),
            text: body.text,
            mood: body.mood,
            author: body.author || 'Anonymous',
            date: new Date().toISOString(),
            imagePath: body.imagePath || null
        }
        console.log('Created new shayari object:', newShayari)

        // Read existing data
        const data = readShayariData()

        // Add new entry
        console.log('Adding new entry to data array, current length:', data.length)
        data.push(newShayari)

        // Debugging data
        console.log('Data to write:', JSON.stringify(data).substring(0, 100) + '...')

        // Write data to file
        if (!writeShayariData(data)) {
            return {
                success: false,
                message: 'Failed to write data to file'
            }
        }

        console.log('Successfully completed POST operation')
        return {
            success: true,
            data: newShayari,
            message: 'Shayari added successfully'
        }
    } catch (error: any) {
        console.error('Error adding shayari:', error)
        // Return more detailed error information
        return {
            success: false,
            message: `Failed to add shayari: ${error.message || 'Unknown error'}`,
            error: error.toString()
        }
    }
})
