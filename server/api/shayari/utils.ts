import fs from 'fs'
import path from 'path'

// Store data in a .data directory in the project - this should be writable without sudo
const dataFilePath = path.resolve(process.cwd(), '.data/shayari.json')

// Log the resolved path for debugging
console.log(`Data file path: ${dataFilePath}`)

// Type for Shayari data
export interface Shayari {
    id: string
    text: string
    mood: string
    author: string
    date: string
    imagePath: string | null
}

// Function to ensure data file exists and is valid
export const ensureDataFile = () => {
    try {
        // Ensure directory exists
        const dataDir = path.dirname(dataFilePath)
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
            console.log(`Created data directory: ${dataDir}`)
        }

        // Initialize file with empty array if it doesn't exist
        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
            console.log(`Created initial data file: ${dataFilePath}`)
            return true
        }

        // Validate existing file
        try {
            const content = fs.readFileSync(dataFilePath, 'utf8')
            if (content.trim() === '') {
                fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
                console.log('Fixed empty data file')
                return true
            }

            JSON.parse(content) // Just to validate
            console.log('Data file contains valid JSON')
            return true
        } catch (validationErr) {
            console.error('Data file contains invalid JSON, resetting:', validationErr)
            fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8')
            return true
        }
    } catch (err) {
        console.error('Error ensuring data file exists and is valid:', err)
        return false
    }
}

// Function to read all shayari entries
export const readShayariData = (): Shayari[] => {
    try {
        // Ensure data file exists and is valid
        ensureDataFile()

        const data = fs.readFileSync(dataFilePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading shayari data:', error)
        return []
    }
}

// Function to save shayari data
export const writeShayariData = (data: Shayari[]): boolean => {
    try {
        // Make sure the data file is still valid
        ensureDataFile()

        // Write back to file
        console.log(`Writing to file: ${dataFilePath}`)
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
        return true
    } catch (writeError) {
        console.error('Error writing to file:', writeError)
        return false
    }
}

// Initial setup on import
ensureDataFile()
