import { defineEventHandler, getQuery } from 'h3'
import { readShayariData, Shayari } from './utils'

/**
 * GET /api/shayari/search
 * Search for shayari entries by mood or text
 */
export default defineEventHandler((event) => {
    const query = getQuery(event)
    const { mood, text } = query

    console.log('GET /api/shayari/search - Searching entries', { mood, text })

    if (!mood && !text) {
        return {
            success: false,
            message: 'At least one search parameter (mood or text) is required'
        }
    }

    const data = readShayariData()

    let results = data

    // Filter by mood if provided
    if (mood) {
        results = results.filter((item: Shayari) =>
            item.mood.toLowerCase().includes(String(mood).toLowerCase())
        )
    }

    // Filter by text if provided
    if (text) {
        results = results.filter((item: Shayari) =>
            item.text.toLowerCase().includes(String(text).toLowerCase())
        )
    }

    return {
        success: true,
        data: results,
        count: results.length,
        message: `Found ${results.length} matching shayari entries`
    }
})
