import fs from 'fs'
import path from 'path'

/**
 * This script fixes the path format in the music metadata file
 * by ensuring all paths start with /api/music/
 * It handles both /music/ paths and any other path formats
 */
async function fixMusicPaths() {
    try {
        // Path to the music metadata file
        const musicDir = path.resolve(process.cwd(), '.data/music')
        const metadataPath = path.resolve(musicDir, 'metadata.json')

        console.log(`Looking for metadata at: ${metadataPath}`)

        // Check if metadata file exists
        if (!fs.existsSync(metadataPath)) {
            console.log('No metadata file found. Nothing to fix.')
            return
        }

        // Read metadata file
        const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
        let metadata = JSON.parse(metadataContent)

        console.log(`Found ${metadata.length} songs in metadata`)
        let fixedCount = 0

        // Update paths that don't have the correct prefix
        metadata = metadata.map(song => {
            // If the path doesn't start with /api/music/
            if (song.path && !song.path.startsWith('/api/music/')) {
                fixedCount++

                let newPath;

                // Case 1: Path starts with /music/
                if (song.path.startsWith('/music/')) {
                    newPath = `/api${song.path}`
                }
                // Case 2: Any other format, build from filename
                else {
                    // Extract the filename - prefer using the filename property, or extract from the path
                    const filename = song.filename || song.path.split('/').pop()
                    newPath = `/api/music/${filename}`
                }

                console.log(`Fixing path for "${song.title || 'Unknown'}" from "${song.path}" to "${newPath}"`)

                return {
                    ...song,
                    path: newPath
                }
            }
            return song
        })

        // Write the updated metadata back to file
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

        console.log(`Fixed ${fixedCount} music path(s) in metadata file`)

    } catch (error) {
        console.error('Error fixing music paths:', error)
    }
}

// Run the function
fixMusicPaths()
