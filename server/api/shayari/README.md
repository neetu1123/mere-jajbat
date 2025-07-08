# Shayari API Documentation

This API provides endpoints for managing Shayari (poetic expressions) in the application.

## API Endpoints

### Get All Shayari
- **URL:** `/api/shayari`
- **Method:** `GET`
- **Response:** Array of Shayari objects

### Get Specific Shayari by ID
- **URL:** `/api/shayari/[id]`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": { /* Shayari object */ }
  }
  ```

### Search Shayari
- **URL:** `/api/shayari/search`
- **Method:** `GET`
- **Query Parameters:**
  - `mood`: Filter by mood (optional)
  - `text`: Search in content (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": [ /* Array of matching Shayari objects */ ],
    "count": 5,
    "message": "Found 5 matching shayari entries"
  }
  ```

### Get Shayari Statistics
- **URL:** `/api/shayari/stats`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalCount": 10,
      "moodCounts": { "happy": 5, "sad": 3, "romantic": 2 },
      "authorCounts": { "Anonymous": 7, "User": 3 },
      "dateRange": {
        "oldest": "2023-01-01T00:00:00.000Z",
        "newest": "2023-06-01T00:00:00.000Z"
      }
    }
  }
  ```

### Create New Shayari
- **URL:** `/api/shayari`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "text": "Your shayari text here",
    "mood": "happy",
    "author": "Author Name", // Optional, defaults to "Anonymous"
    "imagePath": "/path/to/image.jpg" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": { /* Created Shayari object */ },
    "message": "Shayari added successfully"
  }
  ```

### Update Existing Shayari
- **URL:** `/api/shayari/[id]`
- **Method:** `PATCH`
- **Body:** Any of these fields (all optional)
  ```json
  {
    "text": "Updated shayari text",
    "mood": "Updated mood",
    "author": "Updated author name",
    "imagePath": "Updated image path"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": { /* Updated Shayari object */ },
    "message": "Shayari updated successfully"
  }
  ```

### Delete Shayari
- **URL:** `/api/shayari`
- **Method:** `DELETE`
- **Body:**
  ```json
  {
    "id": "shayari-id-to-delete"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Shayari deleted successfully"
  }
  ```

## Data Structure

Each Shayari object has the following structure:

```typescript
interface Shayari {
  id: string;       // Unique identifier
  text: string;     // Content of the shayari
  mood: string;     // Mood/category
  author: string;   // Author name
  date: string;     // ISO date string when created
  imagePath: string | null; // Path to associated image, if any
}
```
