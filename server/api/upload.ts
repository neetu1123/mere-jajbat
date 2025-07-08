import fs from 'fs'
import path from 'path'
import { defineEventHandler, readMultipartFormData } from 'h3'

export const POST = defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      console.error('No form data received')
      return { success: false, message: 'No file uploaded' }
    }

    const file = formData.find(item => item.name === 'image')

    if (!file) {
      console.error('No image file found in request')
      return { success: false, message: 'No image found in request' }
    }

    // Create uploads directory in .data folder (should be writable without sudo)
    const uploadDir = path.resolve(process.cwd(), '.data/uploads')
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
        console.log(`Created upload directory: ${uploadDir}`)
      }

      // Generate unique filename
      const fileExtension = file.filename?.split('.').pop() || 'jpg'
      const uniqueFilename = `${Date.now()}.${fileExtension}`
      const filePath = path.join(uploadDir, uniqueFilename)

      // Check if file.data exists and is valid
      if (!file.data || file.data.length === 0) {
        console.error('File data is empty')
        return { success: false, message: 'File data is empty' }
      }

      // Write file to disk
      fs.writeFileSync(filePath, file.data)
      console.log(`Successfully saved file to: ${filePath}`)

      // Return the relative path for storing in the database
      return {
        success: true,
        imagePath: `/uploads/${uniqueFilename}`
      }
    } catch (fsError) {
      console.error('File system error:', fsError)
      return {
        success: false,
        message: `File system error: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      success: false,
      message: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})
