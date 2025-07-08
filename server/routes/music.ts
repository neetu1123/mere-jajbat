import { createRouter, defineEventHandler, useBase } from 'h3'
import fs from 'fs'
import path from 'path'

const router = createRouter()

// Handler to serve music files from .data directory
router.get('/music/:filename', defineEventHandler((event) => {
    try {
        const filename = event.context.params?.filename
        if (!filename) {
            return { statusCode: 400, body: 'Filename parameter is required' }
        }

        // Construct the path to the music file
        const musicDir = path.resolve(process.cwd(), '.data/music')
        const filePath = path.join(musicDir, filename)

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            // Try public directory as fallback
            const publicFilePath = path.join(process.cwd(), 'public/music', filename)
            if (fs.existsSync(publicFilePath)) {
                const fileStream = fs.createReadStream(publicFilePath)
                event.node.res.setHeader('Content-Type', 'audio/mpeg')
                return fileStream
            }

            return { statusCode: 404, body: 'Music file not found' }
        }

        // Read the file
        const fileStream = fs.createReadStream(filePath)

        // Set response headers for audio
        event.node.res.setHeader('Content-Type', 'audio/mpeg')

        // Stream the file
        return fileStream
    } catch (error) {
        console.error('Error serving music file:', error)
        return {
            statusCode: 500,
            body: `Failed to serve music file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
}))

export default useBase('/api', router.handler)
