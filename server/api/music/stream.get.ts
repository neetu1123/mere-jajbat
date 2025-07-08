import fs from 'fs'
import path from 'path'
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler((event) => {
    try {
        // Get the filename and format from the query
        const query = getQuery(event)
        const filename = query.filename

        if (!filename) {
            return { success: false, message: 'Filename parameter is required' }
        }

        // Construct the path to the music file
        const musicDir = path.resolve(process.cwd(), '.data/music')
        let filePath = path.join(musicDir, filename.toString())

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            // Try alternative locations if file not found
            const publicMusicDir = path.resolve(process.cwd(), 'public/music')
            const altFilePath = path.join(publicMusicDir, filename.toString())

            if (fs.existsSync(altFilePath)) {
                filePath = altFilePath
            } else {
                return {
                    success: false,
                    message: 'Music file not found',
                    error: 'FILE_NOT_FOUND',
                    paths: [filePath, altFilePath]
                }
            }
        }

        // Determine content type based on file extension
        const ext = path.extname(filePath).toLowerCase()
        let contentType = 'audio/mpeg' // Default to MP3

        switch (ext) {
            case '.mp3':
                contentType = 'audio/mpeg'
                break
            case '.wav':
                contentType = 'audio/wav'
                break
            case '.ogg':
                contentType = 'audio/ogg'
                break
            case '.m4a':
                contentType = 'audio/mp4'
                break
            case '.flac':
                contentType = 'audio/flac'
                break
        }

        // Read the file
        const fileStream = fs.createReadStream(filePath)

        // Handle errors with the file stream
        fileStream.on('error', (err) => {
            console.error('Error streaming file:', err)
            event.node.res.statusCode = 500
            event.node.res.end(JSON.stringify({
                success: false,
                message: 'Error reading file',
                error: err.message
            }))
        })

        // Set response headers for audio
        event.node.res.setHeader('Content-Type', contentType)

        // Stream the file
        return fileStream
    } catch (error) {
        console.error('Error serving music file:', error)
        return {
            success: false,
            message: `Failed to serve music file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
})
