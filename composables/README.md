# Shayari API & Composables Documentation

## API Structure

The Shayari API has been restructured for better maintainability and separation of concerns. Each endpoint is now in its own file:

### API Endpoints

- `GET /api/shayari` - Get all shayari entries
- `POST /api/shayari` - Create a new shayari entry
- `DELETE /api/shayari` - Delete a shayari entry by ID
- `GET /api/shayari/[id]` - Get a specific shayari by ID
- `PATCH /api/shayari/[id]` - Update a specific shayari
- `GET /api/shayari/search` - Search for shayari by mood and/or text
- `GET /api/shayari/stats` - Get statistics about shayari data

## Composables

### useShayari Composable

The `useShayari` composable has been updated to use `useFetch` and `useAsyncData` for better performance and SSR support.

```typescript
// Import the composable
import { useShayari } from '~/composables/useShayari'

// Use the composable in your component
const { 
  apiUrls,
  addShayari, 
  deleteShayari, 
  updateShayari, 
  uploadImage
} = useShayari()
```

#### API URLs for useAsyncData

The composable provides URL helpers for using `useAsyncData` in your components:

```typescript
// Example: Get all shayari with SSR support
const { data, pending, error } = useAsyncData(
  'all-shayari',
  () => $fetch(apiUrls.getAllShayari)
)
```

#### Mutation Methods

These methods use `useFetch` internally:

- `addShayari(shayariData)` - Create a new shayari
- `deleteShayari(id)` - Delete a shayari
- `updateShayari(id, shayariData)` - Update a shayari
- `uploadImage(file)` - Upload an image file

#### Helper Methods

- `filterShayaris(mood, searchTerm, author)` - Filter shayari by criteria
- `getUniqueAuthors()` - Get a list of unique authors

## Usage in Components

### GET Operations (Using useAsyncData)

For GET operations, use `useAsyncData` directly in your components for proper SSR support:

```typescript
// In your component script
import { useShayari } from '~/composables/useShayari'

const { apiUrls } = useShayari()

// Fetch all shayari with SSR support
const { data, pending, error, refresh } = useAsyncData(
  'shayari-list',
  () => $fetch(apiUrls.getAllShayari)
)

// Search with filters
const moodFilter = ref('happy')
const searchKey = computed(() => `search-${moodFilter.value}`)

const { data: searchResults } = useAsyncData(
  searchKey,
  () => $fetch(apiUrls.searchShayari({ mood: moodFilter.value })),
  { watch: [moodFilter] }
)
```

### POST, PATCH, DELETE Operations

For mutation operations, use the methods from the composable:

```typescript
// Add a new shayari
const addNewShayari = async () => {
  const newShayari = {
    text: 'Your shayari text',
    mood: 'happy',
    author: 'Your Name'
  }
  
  const result = await addShayari(newShayari)
  if (result) {
    // Shayari added successfully
    refresh() // Refresh the list
  }
}

// Delete a shayari
const removeShayari = async (id) => {
  const result = await deleteShayari(id)
  if (result) {
    // Shayari deleted successfully
    refresh() // Refresh the list
  }
}
```

## Example Page

Check out the `pages/shayari-ssr.vue` file for a complete example of how to use these composables and APIs together in a page with SSR support.
