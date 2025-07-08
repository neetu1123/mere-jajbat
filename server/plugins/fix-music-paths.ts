import fs from 'fs'
import path from 'path'

export default defineNitroPlugin(() => {
    console.log('Running enhanced music paths fix plugin...')
    // Fix music paths in metadata.json to ensure they all start with /api/music/
    try {
        // Path to the music metadata file
        const musicDir = path.resolve(process.cwd(), '.data/music')
        const metadataPath = path.resolve(musicDir, 'metadata.json')

        // Check if metadata file exists
        if (!fs.existsSync(metadataPath)) {
            console.log('No music metadata file found. Nothing to fix.')
            return
        }

        // Read metadata file
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
        let metadata = JSON.parse(metadataContent)

        let fixedCount = 0

        // Update paths that don't have the correct prefix
        metadata = metadata.map((song: { path?: string; filename?: string;[key: string]: any }) => {
            // If the path doesn't start with /api/music/
            if (song.path && !song.path.startsWith('/api/music/')) {
                fixedCount++

                // Case 1: Path starts with /music/
                if (song.path.startsWith('/music/')) {
                    return {
                        ...song,
                        path: `/api${song.path}` // Add /api prefix
                    }
                }
                // Case 2: Any other format, build from filename
                else {
                    const filename = song.filename || song.path.split('/').pop()
                    return {
                        ...song,
                        path: `/api/music/${filename}`
                    }
                }
            }
            return song
        })

        // Only write back if changes were made
        if (fixedCount > 0) {
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
            console.log(`Fixed ${fixedCount} music path(s) in metadata file`)
        }

    } catch (error) {
        console.error('Error fixing music paths:', error)
    }
})
