import fs from 'fs'
import path from 'path'

export default defineNitroPlugin(() => {
    console.log('Server plugin: Setting up data directory...')

    try {
        // Set up both server/data and public/data directories
        const serverDataDir = path.resolve(process.cwd(), 'server/data')
        const publicDataDir = path.resolve(process.cwd(), 'public/data')

        // Create server/data directory if it doesn't exist
        if (!fs.existsSync(serverDataDir)) {
            fs.mkdirSync(serverDataDir, { recursive: true })
            console.log(`Created server data directory: ${serverDataDir}`)
        }

        // Create public/data directory if it doesn't exist
        if (!fs.existsSync(publicDataDir)) {
            fs.mkdirSync(publicDataDir, { recursive: true })
            console.log(`Created public data directory: ${publicDataDir}`)
        }

        // Ensure shayari.json exists in both locations
        const serverDataFilePath = path.resolve(serverDataDir, 'shayari.json')
        const publicDataFilePath = path.resolve(publicDataDir, 'shayari.json')

        // Handle server data file
        if (!fs.existsSync(serverDataFilePath)) {
            fs.writeFileSync(serverDataFilePath, '[]', 'utf8')
            console.log(`Created server shayari.json file: ${serverDataFilePath}`)
        } else {
            // Validate file content
            try {
                const content = fs.readFileSync(serverDataFilePath, 'utf8')
                if (content.trim() === '') {
                    fs.writeFileSync(serverDataFilePath, '[]', 'utf8')
                    console.log('Fixed empty server shayari.json file')
                } else {
                    const data = JSON.parse(content)
                    if (!Array.isArray(data)) {
                        console.warn('Server shayari.json does not contain an array, fixing...')
                        fs.writeFileSync(serverDataFilePath, '[]', 'utf8')
                    }
                }
            } catch (err) {
                console.error('Error validating server shayari.json, resetting file:', err)
                fs.writeFileSync(serverDataFilePath, '[]', 'utf8')
            }
        }

        // Handle public data file
        if (!fs.existsSync(publicDataFilePath)) {
            fs.writeFileSync(publicDataFilePath, '[]', 'utf8')
            console.log(`Created public shayari.json file: ${publicDataFilePath}`)
        } else {
            // Validate file content
            try {
                const content = fs.readFileSync(publicDataFilePath, 'utf8')
                if (content.trim() === '') {
                    fs.writeFileSync(publicDataFilePath, '[]', 'utf8')
                    console.log('Fixed empty public shayari.json file')
                } else {
                    const data = JSON.parse(content)
                    if (!Array.isArray(data)) {
                        console.warn('Public shayari.json does not contain an array, fixing...')
                        fs.writeFileSync(publicDataFilePath, '[]', 'utf8')
                    }
                }
            } catch (err) {
                console.error('Error validating public shayari.json, resetting file:', err)
                fs.writeFileSync(publicDataFilePath, '[]', 'utf8')
            }
        }

        // Ensure public/uploads directory exists
        const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
            console.log(`Created uploads directory: ${uploadsDir}`)
        }
    } catch (error) {
        console.error('Error in setup plugin:', error)
    }
})
