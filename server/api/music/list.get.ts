import fs from 'fs'
import path from 'path'
import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
    try {
        // Path to the music metadata file
        const musicDir = path.resolve(process.cwd(), '.data/music')
        const metadataPath = path.resolve(musicDir, 'metadata.json')

        // Check if metadata file exists
        if (!fs.existsSync(metadataPath)) {
            // Return empty array if no metadata file exists yet
            return { success: true, data: [] }
        }

        // Read metadata file
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
        const metadata = JSON.parse(metadataContent)

        // Return the music list
        return {
            success: true,
            data: metadata
        }
    } catch (error) {
        console.error('Error fetching music list:', error)
        return {
            success: false,
            message: `Failed to fetch music list: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
})
