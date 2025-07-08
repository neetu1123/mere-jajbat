import fs from 'fs'
import path from 'path'

export default defineNitroPlugin(() => {
    // Ensure .data directory exists
    const dataDir = path.resolve(process.cwd(), '.data')
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
        console.log(`Created .data directory: ${dataDir}`)
    }

    // Ensure music directory exists
    const musicDir = path.resolve(dataDir, 'music')
    if (!fs.existsSync(musicDir)) {
        fs.mkdirSync(musicDir, { recursive: true })
        console.log(`Created music directory: ${musicDir}`)
    }

    // Create empty metadata file if it doesn't exist
    const metadataPath = path.resolve(musicDir, 'metadata.json')
    if (!fs.existsSync(metadataPath)) {
        fs.writeFileSync(metadataPath, JSON.stringify([], null, 2))
        console.log(`Created empty music metadata file: ${metadataPath}`)
    }

    // Copy existing music files from public directory if they exist
    try {
        const publicMusicDir = path.resolve(process.cwd(), 'public/music')
        if (fs.existsSync(publicMusicDir)) {
            const files = fs.readdirSync(publicMusicDir)
            const metadataContent = fs.readFileSync(metadataPath, 'utf-8')
            let metadata = JSON.parse(metadataContent)

            // Only process files that are not in metadata
            const existingFilenames = metadata.map((song: any) => song.filename)

            let newSongs = 0

            for (const file of files) {
                if (file.endsWith('.mp3') && !existingFilenames.includes(file)) {
                    // Copy the file
                    const sourcePath = path.join(publicMusicDir, file)
                    const destPath = path.join(musicDir, file)

                    if (!fs.existsSync(destPath)) {
                        fs.copyFileSync(sourcePath, destPath)

                        // Add to metadata
                        const title = file.replace('.mp3', '').replace(/^\d+-/, '').replace(/[_-]/g, ' ')
                        metadata.push({
                            id: Date.now().toString() + newSongs,
                            title: title,
                            artist: 'Sample Music',
                            filename: file,
                            path: `/api/music/${file}`,
                            uploaded: new Date().toISOString()
                        })

                        newSongs++
                    }
                }
            }

            if (newSongs > 0) {
                fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
                console.log(`Added ${newSongs} sample music files to metadata`)
            }
        }
    } catch (err) {
        console.error('Error copying sample music files:', err)
    }
})
