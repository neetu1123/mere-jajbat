import fs from 'fs'
import path from 'path'

export default defineNitroPlugin(() => {
    console.log('Server plugin: Setting up data directories...')

    try {
        // Ensure .data directory exists for data storage
        const dataDir = path.resolve(process.cwd(), '.data')
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
            console.log(`Created data directory: ${dataDir}`)
        }

        // Ensure .data/uploads directory exists for uploads
        const uploadsDir = path.resolve(process.cwd(), '.data/uploads')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
            console.log(`Created uploads directory: ${uploadsDir}`)
        }

        // Initialize shayari.json if it doesn't exist
        const dataFilePath = path.resolve(process.cwd(), '.data/shayari.json')
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
            console.log(`Created initial data file: ${dataFilePath}`)
        } else {
            // Validate existing file
            try {
                const content = fs.readFileSync(dataFilePath, 'utf8')
                if (content.trim() === '') {
                    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
                    console.log('Fixed empty data file')
                } else {
                    JSON.parse(content) // Just to validate
                    console.log('Data file contains valid JSON')
                }
            } catch (validationErr) {
                console.error('Data file contains invalid JSON, resetting:', validationErr)
                fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
            }
        }

        // Also ensure public directories exist for static access
        const publicUploadsDir = path.resolve(process.cwd(), 'public/uploads')
        if (!fs.existsSync(publicUploadsDir)) {
            fs.mkdirSync(publicUploadsDir, { recursive: true })
            console.log(`Created public uploads directory: ${publicUploadsDir}`)
        }

        // Ensure music directory exists
        const musicDir = path.resolve(process.cwd(), 'public/music')
        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true })
            console.log(`Created music directory: ${musicDir}`)
        }
    } catch (error) {
        console.error('Error in setup plugin:', error)
    }
})
