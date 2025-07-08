import { defineEventHandler } from 'h3'
import { readShayariData, Shayari } from './utils'

/**
 * GET /api/shayari/stats
 * Get statistics about shayari entries
 */
export default defineEventHandler(() => {
    console.log('GET /api/shayari/stats - Retrieving statistics')

    const data = readShayariData()

    // Count shayari by mood
    const moodCounts: Record<string, number> = {}
    data.forEach((item: Shayari) => {
        const mood = item.mood
        moodCounts[mood] = (moodCounts[mood] || 0) + 1
    })

    // Count shayari by author
    const authorCounts: Record<string, number> = {}
    data.forEach((item: Shayari) => {
        const author = item.author
        authorCounts[author] = (authorCounts[author] || 0) + 1
    })

    // Get date range
    let oldestDate = new Date()
    let newestDate = new Date(0)

    data.forEach((item: Shayari) => {
        const date = new Date(item.date)
        if (date < oldestDate) oldestDate = date
        if (date > newestDate) newestDate = date
    })

    return {
        success: true,
        data: {
            totalCount: data.length,
            moodCounts,
            authorCounts,
            dateRange: {
                oldest: oldestDate.toISOString(),
                newest: newestDate.toISOString()
            }
        }
    }
})
