import { ref, onMounted } from 'vue'

export const useTheme = () => {
  const isDarkMode = ref(false)

  // Toggle theme function
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value

    // Update document class and localStorage
    if (isDarkMode.value) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  // Initialize theme based on localStorage or system preference
  const initTheme = () => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      isDarkMode.value = true
      document.body.classList.add('dark-mode')
    } else {
      isDarkMode.value = false
      document.body.classList.remove('dark-mode')
    }
  }

  // Watch for system preference changes
  const watchSystemThemeChanges = () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (!localStorage.getItem('theme')) { // Only apply if user hasn't set a preference
        isDarkMode.value = event.matches
        if (isDarkMode.value) {
          document.body.classList.add('dark-mode')
        } else {
          document.body.classList.remove('dark-mode')
        }
      }
    })
  }

  // Initialize on component mount
  onMounted(() => {
    initTheme()
    watchSystemThemeChanges()
  })

  return {
    isDarkMode,
    toggleTheme
  }
}
