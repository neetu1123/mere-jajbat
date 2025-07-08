<template>
  <div class="mb-8 transition-all duration-300 hover:transform hover:scale-[1.01]">
    <div class="relative rounded-2xl overflow-hidden shadow-lg border border-pink-100 dark:border-gray-700">
      <div
        class="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20">
      </div>
      <textarea v-model="shayariText" rows="4" placeholder="Apni Shayari likhiye... ✨"
        class="shayari-text input-focus w-full p-6 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-white focus:outline-none transition-all duration-300 text-xl z-10 relative"
        @input="updateCharCount"></textarea>

      <div
        class="flex flex-wrap items-center gap-3 p-4 bg-white/90 dark:bg-gray-800/90 border-t border-pink-100 dark:border-gray-700">
        <div class="flex flex-1 items-center gap-2">
          <div class="relative group">
            <label class="text-pink-700 dark:text-pink-400 font-medium flex items-center gap-1">
              <i class="fas fa-palette"></i> मूड:
            </label>
            <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full">
            </div>
          </div>
          <select v-model="mood"
            class="border border-pink-300 dark:border-pink-500 rounded-lg p-3 bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-white backdrop-blur-sm flex-1">
            <option value="happy">😊 Happy</option>
            <option value="sad">💔 Sad</option>
            <option value="love">❤️ Love</option>
            <option value="inspiration">✨ Inspiration</option>
            <option value="nature">🌿 Nature</option>
            <option value="nostalgia">🕰️ Nostalgia</option>
          </select>
        </div>

        <!-- Author input field -->
        <div class="flex flex-1 items-center gap-2">
          <div class="relative group">
            <label class="text-pink-700 dark:text-pink-400 font-medium flex items-center gap-1">
              <i class="fas fa-user"></i> नाम:
            </label>
            <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full">
            </div>
          </div>
          <input v-model="author" type="text" placeholder="आपका नाम..."
            class="border border-pink-300 dark:border-pink-500 rounded-lg p-3 bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-white backdrop-blur-sm flex-1">
        </div>

        <!-- Image upload for shayari -->
        <div class="flex-1 flex items-center gap-2">
          <div class="relative group">
            <label class="text-pink-700 dark:text-pink-400 font-medium flex items-center gap-1">
              <i class="fas fa-image"></i> तस्वीर:
            </label>
            <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full">
            </div>
          </div>
          <button @click="triggerImageUpload"
            class="border border-pink-300 dark:border-pink-500 rounded-lg p-3 bg-white/60 dark:bg-gray-700/60 text-gray-800 dark:text-white backdrop-blur-sm flex-1 text-center">
            <i class="fas fa-camera mr-1"></i> Upload Image
          </button>
          <input ref="imageUploadInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden"
            @change="handleImageUpload">
          <div v-if="imagePreview"
            class="w-12 h-12 rounded-lg overflow-hidden border border-pink-300 dark:border-pink-500">
            <img :src="imagePreview" class="w-full h-full object-cover">
          </div>
        </div>

        <div class="text-sm text-gray-500 dark:text-gray-400 px-2">
          {{ charCount }}/500
        </div>
      </div>
    </div>

    <!-- File Upload options -->
    <div class="mt-4 flex flex-col sm:flex-row gap-4 items-center">
      <div class="flex gap-2 items-center">
        <button @click="triggerTextFileUpload"
          class="btn-effect px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2">
          <i class="fas fa-file-alt"></i>
          <span>Upload Text File</span>
        </button>
        <input ref="textFileUploadInput" type="file" accept=".txt" class="hidden" @change="handleTextFileUpload">
      </div>

      <div class="flex gap-2 items-center">
        <button @click="triggerExcelFileUpload"
          class="btn-effect px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2">
          <i class="fas fa-file-excel"></i>
          <span>Upload Excel File</span>
        </button>
        <input ref="excelFileUploadInput" type="file" accept=".xlsx" class="hidden" @change="handleExcelFileUpload">
      </div>

      <div class="flex-grow"></div>

      <button @click="submitShayari"
        class="btn-hover-effect btn-effect bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600 text-white px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 flex items-center justify-center gap-2 shadow-lg"
        :disabled="isLoading">
        <i class="fas fa-heart"></i>
        <span>{{ isLoading ? 'Adding...' : 'Add Shayari' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'
import { ref, onMounted, computed } from 'vue'
import { useShayariApi } from '~/composables/useShayariApi'

const { createShayari, updateShayari, deleteShayari } = useShayariApi()
const isLoading = ref(false)

// Function to upload image (to be implemented)
const uploadImage = async (file) => {
  // Placeholder - replace with actual image upload logic
  console.log("Image upload would happen here", file)
  return null
}

// Form fields
const shayariText = ref('')
const mood = ref('happy')
const author = ref('')
const imageFile = ref(null)
const imagePreview = ref(null)
const charCount = ref(0)

// File upload references
const imageUploadInput = ref(null)
const textFileUploadInput = ref(null)
const excelFileUploadInput = ref(null)

// Maximum character count for shayari
const MAX_CHARS = 500

// Update character count
const updateCharCount = () => {
  charCount.value = shayariText.value.length

  // Truncate if exceeds max length
  if (charCount.value > MAX_CHARS) {
    shayariText.value = shayariText.value.substring(0, MAX_CHARS)
    charCount.value = MAX_CHARS
  }
}

// Handle image upload
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Store file for submission
  imageFile.value = file

  // Create preview
  imagePreview.value = URL.createObjectURL(file)
}

// Trigger the hidden file inputs
const triggerImageUpload = () => {
  imageUploadInput.value.click()
}

const triggerTextFileUpload = () => {
  textFileUploadInput.value.click()
}

const triggerExcelFileUpload = () => {
  excelFileUploadInput.value.click()
}

// Handle text file upload
const handleTextFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    shayariText.value = e.target.result
    updateCharCount()
  }
  reader.readAsText(file)
}

// Handle Excel file upload
const handleExcelFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)

      if (jsonData.length > 0) {
        // Use first row's content as shayari text if available
        const firstRow = jsonData[0]
        if (firstRow.text || firstRow.shayari || firstRow.content) {
          shayariText.value = firstRow.text || firstRow.shayari || firstRow.content
        }
        if (firstRow.author) {
          author.value = firstRow.author
        }
        if (firstRow.mood) {
          mood.value = firstRow.mood
        }
        updateCharCount()
      }
    } catch (err) {
      console.error('Error reading Excel file:', err)
      alert('Could not read the Excel file. Make sure it has the correct format.')
    }
  }
  reader.readAsArrayBuffer(file)
}

// Submit shayari form
const submitShayari = async () => {
  if (!shayariText.value.trim()) {
    alert('Please enter your shayari text')
    return
  }

  try {
    // Save author name for future use if content is available
    if (author.value) {
      localStorage.setItem('lastAuthor', author.value)
    }

    let imagePath = null

    // Upload image if available
    if (imageFile.value) {
      imagePath = await uploadImage(imageFile.value)
    }

    // Create shayari object
    const newShayari = {
      text: shayariText.value,
      mood: mood.value,
      author: author.value || 'Anonymous',
      imagePath
    }

    // Add to database
    isLoading.value = true
    try {
      const { data } = await createShayari(newShayari)

      if (data.value && data.value.success) {
        // Reset form
        shayariText.value = ''
        imageFile.value = null
        imagePreview.value = null
        charCount.value = 0

        // Keep the author name for convenience
      }
    } catch (err) {
      console.error('Error submitting shayari:', err)
      alert('Failed to submit shayari. Please try again.')
    } finally {
      isLoading.value = false
    }
  } catch (err) {
    console.error('Error in overall shayari submission process:', err)
    alert('An unexpected error occurred. Please try again.')
  }
}

// Load saved author name
onMounted(() => {
  const savedAuthor = localStorage.getItem('lastAuthor')
  if (savedAuthor) {
    author.value = savedAuthor
  }
})
</script>
