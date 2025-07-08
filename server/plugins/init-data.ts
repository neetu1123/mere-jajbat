import fs from 'fs'
import path from 'path'

export default defineNitroPlugin(() => {
    console.log('Server plugin: Initializing data directories...')

    try {
        // Set up both temporary data and uploads directories
        const tmpDataDir = path.resolve(process.cwd(), 'tmp')
        const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
        const musicDir = path.resolve(process.cwd(), 'public/music')

        // Create tmp directory
        if (!fs.existsSync(tmpDataDir)) {
            fs.mkdirSync(tmpDataDir, { recursive: true })
            console.log(`Created tmp directory: ${tmpDataDir}`)
        }

        // Create uploads directory
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
            console.log(`Created uploads directory: ${uploadsDir}`)
        }

        // Create music directory
        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true })
            console.log(`Created music directory: ${musicDir}`)
        }

        // Ensure shayari.json exists in tmp location
        const dataFilePath = path.resolve(tmpDataDir, 'shayari.json')

        // Handle tmp data file
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, '[]', 'utf8')
            console.log(`Created shayari.json file: ${dataFilePath}`)
        } else {
            // Validate file content
            try {
                const content = fs.readFileSync(dataFilePath, 'utf8')
                if (content.trim() === '') {
                    fs.writeFileSync(dataFilePath, '[]', 'utf8')
                    console.log('Fixed empty shayari.json file')
                } else {
                    try {
                        const data = JSON.parse(content)
                        if (!Array.isArray(data)) {
                            console.warn('shayari.json does not contain an array, fixing...')
                            fs.writeFileSync(dataFilePath, '[]', 'utf8')
                        }
                    } catch (err) {
                        console.error('Error validating shayari.json, resetting file:', err)
                        fs.writeFileSync(dataFilePath, '[]', 'utf8')
                    }
                }
            } catch (err) {
                console.error('Error checking shayari.json:', err)
                fs.writeFileSync(dataFilePath, '[]', 'utf8')
            }
        }

        // Check all permissions by writing a test file
        try {
            const testFile = path.join(tmpDataDir, '.permission-test')
            fs.writeFileSync(testFile, 'test', 'utf8')
            fs.unlinkSync(testFile)
            console.log('Tmp directory is writable')
        } catch (err) {
            console.error('Tmp directory is not writable!', err)
        }

        console.log('Data initialization complete.')
    } catch (error) {
        console.error('Error in initialization plugin:', error)
    }
})
