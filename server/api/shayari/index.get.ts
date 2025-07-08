import { defineEventHandler } from 'h3'
import { readShayariData } from './utils'

/**
 * GET /api/shayari
 * Returns all shayari entries
 */
export default defineEventHandler(() => {
    console.log('GET /api/shayari - Retrieving all entries')
    return readShayariData()
})
