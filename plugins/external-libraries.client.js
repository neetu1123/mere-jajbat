// Client-side plugin to initialize libraries
export default defineNuxtPlugin({
  name: 'external-libraries',
  enforce: 'post',
  // Only run on client-side
  async setup(nuxtApp) {
    // Make sure we're in the browser environment
    if (process.client) {
      // Load particles.js if not already loaded
      if (!window.particlesJS) {
        console.log('Loading particles.js')
        const particlesScript = document.createElement('script')
        particlesScript.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js'
        particlesScript.async = true
        document.head.appendChild(particlesScript)
      }

      // Load XLSX if not already loaded
      if (!window.XLSX) {
        console.log('Loading XLSX.js')
        const xlsxScript = document.createElement('script')
        xlsxScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
        xlsxScript.async = true
        document.head.appendChild(xlsxScript)
      }

      // Load Font Awesome if not already loaded
      const fontAwesome = document.querySelector('link[href*="font-awesome"]')
      if (!fontAwesome) {
        console.log('Loading Font Awesome')
        const faLink = document.createElement('link')
        faLink.rel = 'stylesheet'
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        document.head.appendChild(faLink)
      }

      // Initialize particles.js when the app is mounted
      nuxtApp.hook('app:mounted', () => {
        // Wait a short time to ensure particlesJS is loaded
        setTimeout(() => {
          if (window.particlesJS && document.getElementById('particles-js')) {
            console.log('Particles.js initialized')
            window.particlesJS('particles-js', {
              particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#ec4899' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#ec4899', opacity: 0.2 },
                move: { enable: true, speed: 2, direction: 'none', random: true }
              }
            })
          }
        }, 500)
      })
    }
  }
})
