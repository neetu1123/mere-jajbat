import fs from 'fs'
import path from 'path'
import { defineEventHandler, getQuery, createError } from 'h3'

// Handle GET requests to /api/uploads to serve uploaded files
export const GET = defineEventHandler((event) => {
    try {
        const query = getQuery(event)
        const filename = query.filename

        if (!filename) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing filename parameter'
            })
        }

        // Prevent path traversal attacks by removing .. and other dangerous patterns
        const sanitizedFilename = filename.toString().replace(/\.\./g, '').replace(/[\/\\]/g, '')

        // Check both possible upload directories
        let filePath = path.resolve(process.cwd(), '.data/uploads', sanitizedFilename)

        if (!fs.existsSync(filePath)) {
            // Try public directory as fallback
            filePath = path.resolve(process.cwd(), 'public/uploads', sanitizedFilename)

            if (!fs.existsSync(filePath)) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'File not found'
                })
            }
        }

        try {
            const fileContent = fs.readFileSync(filePath)

            // Set content type based on file extension
            const ext = path.extname(filePath).toLowerCase()
            let contentType = 'application/octet-stream'

            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg'
                    break
                case '.png':
                    contentType = 'image/png'
                    break
                case '.gif':
                    contentType = 'image/gif'
                    break
                case '.webp':
                    contentType = 'image/webp'
                    break
            }

            // Set appropriate headers
            event.node.res.setHeader('Content-Type', contentType)
            event.node.res.setHeader('Content-Length', fileContent.length)
            event.node.res.setHeader('Cache-Control', 'public, max-age=31536000')

            return fileContent
        } catch (readError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error reading file'
            })
        }
    } catch (error) {
        if (!error.statusCode) {
            return createError({
                statusCode: 500,
                statusMessage: 'Internal server error'
            })
        }
        return error
    }
})
