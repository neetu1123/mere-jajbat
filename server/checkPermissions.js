// Use ES module imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check both paths: server/data for API and public/data for client access
const serverDataFilePath = path.resolve(process.cwd(), 'server/data/shayari.json');
const publicDataFilePath = path.resolve(process.cwd(), 'public/data/shayari.json');
const uploadDir = path.resolve(process.cwd(), 'public/uploads');

console.log('Checking permissions and directories...')

// Check server data directory
const serverDataDir = path.dirname(serverDataFilePath)
try {
    console.log(`Server data directory path: ${serverDataDir}`)

    if (!fs.existsSync(serverDataDir)) {
        console.log('Server data directory does not exist, creating...')
        fs.mkdirSync(serverDataDir, { recursive: true })
        console.log('Created server data directory')
    } else {
        console.log('Server data directory exists')

        try {
            // Check if we can write to the directory
            const testFile = path.join(serverDataDir, '.test-write')
            fs.writeFileSync(testFile, 'test', 'utf8')
            fs.unlinkSync(testFile)
            console.log('Server data directory is writable')
        } catch (e) {
            console.error('Server data directory is not writable!', e)
        }
    }

    // Check server data file
    if (!fs.existsSync(serverDataFilePath)) {
        console.log('Server data file does not exist, creating...')
        fs.writeFileSync(serverDataFilePath, '[]', 'utf8')
        console.log('Created server data file')
    } else {
        console.log('Server data file exists')

        try {
            // Check if file is readable
            const content = fs.readFileSync(serverDataFilePath, 'utf8')
            console.log(`Server data file content (first 100 chars): ${content.substring(0, 100)}`)

            // Check if file is parseable
            try {
                const data = JSON.parse(content)
                console.log('Server data file contains valid JSON, type:', typeof data)
                console.log('Is array:', Array.isArray(data))
                console.log('Length:', Array.isArray(data) ? data.length : 'N/A')
            } catch (e) {
                console.error('Server data file contains invalid JSON!', e)
                console.log('Creating backup and resetting file...')
                fs.copyFileSync(serverDataFilePath, `${serverDataFilePath}.bak`)
                fs.writeFileSync(serverDataFilePath, '[]', 'utf8')
                console.log('Reset completed')
            }

            // Check if file is writable
            try {
                fs.appendFileSync(serverDataFilePath, '')
                console.log('Server data file is writable')
            } catch (e) {
                console.error('Server data file is not writable!', e)
            }
        } catch (e) {
            console.error('Cannot read data file!', e)
        }
    }
} catch (e) {
    console.error('Error checking server data directory:', e)
}

// Check public data directory
const publicDataDir = path.dirname(publicDataFilePath)
try {
    console.log(`\nPublic data directory path: ${publicDataDir}`)

    if (!fs.existsSync(publicDataDir)) {
        console.log('Public data directory does not exist, creating...')
        fs.mkdirSync(publicDataDir, { recursive: true })
        console.log('Created public data directory')
    } else {
        console.log('Public data directory exists')

        try {
            // Check if we can write to the directory
            const testFile = path.join(publicDataDir, '.test-write')
            fs.writeFileSync(testFile, 'test', 'utf8')
            fs.unlinkSync(testFile)
            console.log('Public data directory is writable')
        } catch (e) {
            console.error('Public data directory is not writable!', e)
        }
    }

    // Check public data file
    if (!fs.existsSync(publicDataFilePath)) {
        console.log('Public data file does not exist, creating...')
        fs.writeFileSync(publicDataFilePath, '[]', 'utf8')
        console.log('Created public data file')
    } else {
        console.log('Public data file exists')

        try {
            // Check if file is readable
            const content = fs.readFileSync(publicDataFilePath, 'utf8')
            console.log(`Public data file content (first 100 chars): ${content.substring(0, 100)}`)

            // Check if file is parseable
            try {
                const data = JSON.parse(content)
                console.log('Public data file contains valid JSON, type:', typeof data)
                console.log('Is array:', Array.isArray(data))
                console.log('Length:', Array.isArray(data) ? data.length : 'N/A')
            } catch (e) {
                console.error('Public data file contains invalid JSON!', e)
                console.log('Creating backup and resetting file...')
                fs.copyFileSync(publicDataFilePath, `${publicDataFilePath}.bak`)
                fs.writeFileSync(publicDataFilePath, '[]', 'utf8')
                console.log('Reset completed')
            }

            // Check if file is writable
            try {
                fs.appendFileSync(publicDataFilePath, '')
                console.log('Public data file is writable')
            } catch (e) {
                console.error('Public data file is not writable!', e)
            }
        } catch (e) {
            console.error('Cannot read public data file!', e)
        }
    }
} catch (e) {
    console.error('Error checking public data directory:', e)
}

// Check uploads directory
try {
    console.log(`\nUploads directory path: ${uploadDir}`)

    if (!fs.existsSync(uploadDir)) {
        console.log('Uploads directory does not exist, creating...')
        fs.mkdirSync(uploadDir, { recursive: true })
        console.log('Created uploads directory')
    } else {
        console.log('Uploads directory exists')

        try {
            // Check if we can write to the directory
            const testFile = path.join(uploadDir, '.test-write')
            fs.writeFileSync(testFile, 'test', 'utf8')
            fs.unlinkSync(testFile)
            console.log('Uploads directory is writable')
        } catch (e) {
            console.error('Uploads directory is not writable!', e)
        }
    }
} catch (e) {
    console.error('Error checking uploads directory:', e)
}

console.log('\nCheck completed')
