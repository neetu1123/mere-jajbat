import fs from 'fs'
import path from 'path'
import { defineEventHandler, getQuery } from 'h3'
import os from 'os'

export default defineEventHandler((event) => {
    try {
        // Get the filename from the URL query
        const query = getQuery(event)
        const filename = query.filename

        if (!filename) {
            return { statusCode: 400, body: 'Filename parameter is required' }
        }

        // Construct the path to the uploaded file
        const userHomeDir = os.homedir()
        const filePath = path.resolve(userHomeDir, 'shayari_uploads', filename.toString())

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return { statusCode: 404, body: 'File not found' }
        }

        // Read the file
        const file = fs.readFileSync(filePath)

        // Determine content type based on extension
        const ext = path.extname(filePath).toLowerCase()
        let contentType = 'application/octet-stream' // Default content type

        if (ext === '.jpg' || ext === '.jpeg') {
            contentType = 'image/jpeg'
        } else if (ext === '.png') {
            contentType = 'image/png'
        } else if (ext === '.gif') {
            contentType = 'image/gif'
        } else if (ext === '.webp') {
            contentType = 'image/webp'
        }

        // Set response headers
        event.node.res.setHeader('Content-Type', contentType)
        event.node.res.setHeader('Content-Length', file.length)

        // Return the file
        return file
    } catch (error) {
        console.error('Error serving uploaded file:', error)
        return { statusCode: 500, body: 'Internal server error' }
    }
})
