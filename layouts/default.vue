<template>
  <div>
    <!-- Background particles -->
    <ClientOnly>
      <div ref="particlesContainer" class="bg-particles" id="particles-js"></div>
    </ClientOnly>

    <AppNavbar @toggle-settings="showSettings = !showSettings" />

    <main>
      <slot />
    </main>

    <AudioPlayer :default-music="'/music/happ.mp3'" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppNavbar from '~/components/AppNavbar.vue'
import AudioPlayer from '~/components/AudioPlayer.vue'

const particlesContainer = ref(null)
const showSettings = ref(false)

onMounted(() => {
  // Initialize particles.js when component is mounted
  if (process.client && window.particlesJS && particlesContainer.value) {
    window.particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#ec4899'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          },
          polygon: {
            nb_sides: 5
          }
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ec4899',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    });
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --primary-light: #ec4899;
  --primary-dark: #be185d;
  --secondary-light: #8b5cf6;
  --secondary-dark: #6d28d9;
  --accent-light: #f472b6;
  --accent-dark: #db2777;
  --background-light: #f5f7fa;
  --background-dark: #141e30;
  --text-light: #334155;
  --text-dark: #f8fafc;
  --card-light: rgba(255, 255, 255, 0.8);
  --card-dark: rgba(30, 41, 59, 0.8);
  --transition-speed: 0.4s;
}

body {
  font-family: 'Poppins', sans-serif;
  background-image: linear-gradient(135deg, var(--background-light) 0%, #c3cfe2 100%);
  background-size: 200% 200%;
  min-height: 100vh;
  transition: all var(--transition-speed) ease;
  overflow-x: hidden;
  animation: gradientBackground 15s ease infinite;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%
  }

  50% {
    background-position: 100% 50%
  }

  100% {
    background-position: 0% 50%
  }
}

.dark-mode {
  background-image: linear-gradient(135deg, var(--background-dark) 0%, #243b55 100%);
  color: var(--text-dark);
}

.shayari-text {
  font-family: 'Kalam', cursive;
  line-height: 1.8;
}

.shayari-card {
  transition: all var(--transition-speed) cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shayari-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.btn-effect {
  transition: all var(--transition-speed) cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.btn-effect:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: width 0.4s ease;
}

.btn-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
}

.btn-effect:hover:before {
  width: 100%;
}

.btn-effect:active {
  transform: translateY(-1px);
}

.bg-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.floating-music-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  backdrop-filter: blur(10px);
  transition: all var(--transition-speed) cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform-origin: bottom right;
}

.floating-music-controls.hidden {
  transform: scale(0.5);
  opacity: 0;
}

.theme-selector {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.input-focus {
  transition: all var(--transition-speed) ease;
}

.input-focus:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.3);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(219, 39, 119, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(219, 39, 119, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(219, 39, 119, 0);
  }
}

.entry-animation {
  opacity: 0;
  animation: fadeInUp 0.7s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shimmer {
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.author-tag {
  position: relative;
  transition: all 0.3s ease;
}

.author-tag:hover {
  transform: translateY(-3px);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-flip {
  perspective: 1000px;
}

.card-flip:hover .card-inner {
  transform: rotateY(10deg);
}

.card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

/* Additional animations */
.btn-hover-effect {
  position: relative;
  overflow: hidden;
}

.btn-hover-effect:after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  transition: 0.5s;
}

.btn-hover-effect:hover:after {
  left: 100%;
}

/* Animated background for mood-specific themes */
.mood-bg-happy {
  background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
}

.mood-bg-sad {
  background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
}

.mood-bg-love {
  background: linear-gradient(120deg, #ff9a9e 0%, #fad0c4 100%);
}

.mood-bg-inspiration {
  background: linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%);
}

.mood-bg-nature {
  background: linear-gradient(120deg, #96fbc4 0%, #f9f586 100%);
}

.mood-bg-nostalgia {
  background: linear-gradient(120deg, #ffecd2 0%, #fcb69f 100%);
}
</style>
