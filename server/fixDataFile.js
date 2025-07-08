// Standalone script to fix shayari.json file issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.resolve(process.cwd(), 'public/data/shayari.json');

console.log('Fixing data file issues...');
console.log(`Working with file: ${dataFilePath}`);

try {
  // Create directory if it doesn't exist
  const dataDir = path.dirname(dataFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created directory: ${dataDir}`);
  }

  // Check if file exists
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
    console.log('Created new empty data file');
  } else {
    // Read and validate current content
    try {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      console.log(`File content length: ${content.length} characters`);

      if (content.trim() === '') {
        // Empty file
        fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
        console.log('File was empty, initialized with empty array');
      } else {
        // Try parsing
        try {
          const data = JSON.parse(content);
          console.log('Current file contains valid JSON');

          if (!Array.isArray(data)) {
            console.log('Warning: Content is not an array, replacing with empty array');
            fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
          } else {
            console.log(`Data contains ${data.length} shayari entries`);
            // Just rewrite the file to ensure it's properly formatted
            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
            console.log('File rewritten with proper formatting');
          }
        } catch (parseErr) {
          console.error('File contains invalid JSON, resetting:', parseErr.message);
          // Create backup before replacing
          fs.writeFileSync(`${dataFilePath}.bak`, content, 'utf8');
          console.log('Created backup of corrupted file');
          fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
          console.log('Reset file with empty array');
        }
      }
    } catch (readErr) {
      console.error('Error reading file:', readErr);
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
      console.log('Created new empty data file after read error');
    }
  }

  // Test file write permissions
  try {
    fs.accessSync(dataFilePath, fs.constants.W_OK);
    console.log('File has write permissions');
  } catch (permErr) {
    console.error('File does not have write permissions!', permErr);
    try {
      fs.chmodSync(dataFilePath, 0o666);
      console.log('Updated file permissions');
    } catch (chmodErr) {
      console.error('Failed to change file permissions:', chmodErr);
    }
  }

  console.log('File fixing completed');
} catch (err) {
  console.error('Unexpected error:', err);
}
