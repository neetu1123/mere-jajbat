import fs from 'fs'
import path from 'path'
import os from 'os'

export default defineNitroPlugin(() => {
    console.log('Setting up user directories for Shayari app...')

    // Define paths
    const userHomeDir = os.homedir()
    const dataDir = path.resolve(userHomeDir, 'shayari_data')
    const uploadsDir = path.resolve(userHomeDir, 'shayari_uploads')
    const dataFilePath = path.resolve(dataDir, 'shayari.json')

    try {
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
            console.log(`Created data directory: ${dataDir}`)
        }

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
            console.log(`Created uploads directory: ${uploadsDir}`)
        }

        // Create data file if it doesn't exist
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
            console.log(`Created data file: ${dataFilePath}`)
        } else {
            // Validate existing file
            try {
                const content = fs.readFileSync(dataFilePath, 'utf8')
                if (content.trim() === '') {
                    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
                    console.log('Fixed empty data file')
                } else {
                    try {
                        JSON.parse(content) // Just to validate
                        console.log('Data file contains valid JSON')
                    } catch (err) {
                        console.error('Data file contains invalid JSON, resetting:', err)
                        fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
                    }
                }
            } catch (err) {
                console.error('Error validating data file:', err)
            }
        }

        // Create server endpoints for uploaded files
        // This will be handled in nitro.config or specific API routes

        console.log('User directories setup completed!')
    } catch (err) {
        console.error('Error setting up user directories:', err)
    }
})
