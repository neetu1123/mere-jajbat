import fs from 'fs'
import path from 'path'
import { defineEventHandler, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
    try {
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            console.error('No form data received')
            return { success: false, message: 'No file uploaded' }
        }

        const file = formData.find(item => item.name === 'file')
        const title = formData.find(item => item.name === 'title')?.data?.toString() || 'Untitled'
        const artist = formData.find(item => item.name === 'artist')?.data?.toString() || 'Unknown Artist'
        const mood = formData.find(item => item.name === 'mood')?.data?.toString() || ''

        if (!file) {
            console.error('No music file found in request')
            return { success: false, message: 'No music file found in request' }
        }

        // Create music directory in .data folder
        const musicDir = path.resolve(process.cwd(), '.data/music')
        try {
            if (!fs.existsSync(musicDir)) {
                fs.mkdirSync(musicDir, { recursive: true })
                console.log(`Created music directory: ${musicDir}`)
            }

            // Generate unique filename
            const fileExtension = file.filename?.split('.').pop() || 'mp3'
            const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const uniqueFilename = `${Date.now()}_${sanitizedTitle}.${fileExtension}`
            const filePath = path.join(musicDir, uniqueFilename)

            // Check if file.data exists and is valid
            if (!file.data || file.data.length === 0) {
                console.error('File data is empty')
                return { success: false, message: 'File data is empty' }
            }

            // Write file to disk
            fs.writeFileSync(filePath, file.data)
            console.log(`Successfully saved music file to: ${filePath}`)

            // Update music metadata file
            const metadataPath = path.resolve(musicDir, 'metadata.json')
            let metadata = []

            if (fs.existsSync(metadataPath)) {
                try {
                    const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
                    metadata = JSON.parse(metadataContent)
                } catch (err) {
                    console.error('Error reading metadata file:', err)
                    // Continue with empty metadata if file is corrupted
                }
            }

            // Add new song metadata
            metadata.push({
                id: Date.now().toString(),
                title,
                artist,
                mood,
                filename: uniqueFilename,
                path: `/api/music/${uniqueFilename}`,
                uploaded: new Date().toISOString()
            })

            // Save updated metadata
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

            // Return the relative path and metadata for the uploaded music
            return {
                success: true,
                data: {
                    title,
                    artist,
                    mood,
                    path: `/api/music/${uniqueFilename}`
                }
            }
        } catch (fsError) {
            console.error('File system error:', fsError)
            return {
                success: false,
                message: `File system error: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`
            }
        }
    } catch (error) {
        console.error('Error uploading music:', error)
        return {
            success: false,
            message: `Failed to upload music: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
})
