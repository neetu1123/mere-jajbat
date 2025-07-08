# Mere Jazbaat - Shayari Diary

A modern web application for creating, storing, and managing shayari (poetry) built with Nuxt.js 3, featuring a beautiful UI with animations, themes, and multimedia integration.

## Features

- Create and save shayaris with different mood categories
- Upload and associate images with your shayaris
- Background music player with custom music upload
- Dark/light theme support
- Filter and search functionality
- Multiple file format support (text, Excel)
- Responsive design with animations
- JSON file storage for persistent data

## Tech Stack

- **Framework**: Nuxt.js 3
- **UI**: Tailwind CSS with custom animations
- **State Management**: Vue Composition API with composables
- **APIs**: Server-side Nitro API endpoints
- **Storage**: File-based JSON data persistence
- **Styling**: Custom CSS with gradients, animations, and glass effects
- **Libraries**:
  - Particles.js for background effects
  - XLSX for Excel file processing
  - Font Awesome for icons
  - Animate.css for animations

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Directory Structure

- `components/` - Vue components for the UI
- `composables/` - Reusable Vue composition functions
- `layouts/` - Page layouts
- `pages/` - Application pages
- `public/` - Static assets and uploaded files
- `server/` - API endpoints and server-side functionality
  - `api/` - API routes for shayari and uploads
  - `data/` - JSON storage
  - `plugins/` - Server-side plugins

## Required Directories

Make sure these directories exist and are writable:
```bash
mkdir -p public/uploads server/data
```

## Troubleshooting

If you encounter issues:

1. Make sure the `server/data` and `public/uploads` directories exist and are writable
2. Check that `server/data/shayari.json` exists and contains a valid JSON array (`[]` is valid for empty)
3. Verify that the client can connect to the API endpoints
4. Check the server logs for any file permission or path issues
5. If you get 500 errors, run this script to verify data files:

```bash
node server/checkPermissions.js
```

## Adding Music Files

Place your audio files in the `public/music` directory with these names:
- happy.mp3
- sad.mp3
- love.mp3
- inspiration.mp3
- nature.mp3
- nostalgia.mp3
# mere-jajbat
