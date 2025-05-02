import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    // Get images from both new and old folders
    const newImagesPromise = list({
      prefix: 'uploads/images/', // New folder structure
    });
    
    const oldImagesPromise = list({
      prefix: 'uploads/', // Old folder structure
    });
    
    // Wait for both requests to complete
    const [newImagesResult, oldImagesResult] = await Promise.all([
      newImagesPromise, 
      oldImagesPromise
    ]);
    
    // Combine blobs, filtering out any duplicates and non-images
    const allBlobs = [
      ...newImagesResult.blobs,
      // Only include old blobs that don't start with 'uploads/images/' (to avoid duplicates)
      ...oldImagesResult.blobs.filter((blob) => !blob.pathname.startsWith('uploads/images/'))
    ];
    
    // Filter to only include image files
    const imageBlobs = allBlobs.filter((blob) => {
      return blob.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    });

    // Transform blob objects to our Image interface format
    const images = imageBlobs
      .map(blob => {
        // Extract timestamp from filename for better sorting
        const timestampMatch = blob.pathname.match(/\/(\d+)-/);
        const timestamp = timestampMatch 
          ? parseInt(timestampMatch[1], 10) 
          : new Date(blob.uploadedAt).getTime();
        
        // Extract caption from the filename path since Vercel Blob doesn't support custom metadata
        const caption = extractCaptionFromPath(blob.pathname);
        
        // Generate a unique ID based on pathname
        const id = blob.pathname.replace(/^uploads\//, '').replace(/^images\//, '');
        
        return {
          id,
          url: blob.url,
          caption,
          author: 'You',
          timestamp,
          likes: 0
        };
      })
      // Sort by newest first
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing images from Vercel Blob:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch images',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Helper to extract caption from filename
function extractCaptionFromPath(path: string): string {
  try {
    // Handle different path formats
    const filename = path.includes('/images/') 
      ? path.replace(/^uploads\/images\/\d+-/, '') // New format
      : path.replace(/^uploads\//, '');           // Old format
    
    // If there's no caption embedded, just beautify the filename
    if (!filename.includes('-')) {
      return beautifyText(filename.replace(/\.\w+$/, ''));
    }
    
    // Extract the caption part (everything before the last hyphen)
    const lastHyphenIndex = filename.lastIndexOf('-');
    if (lastHyphenIndex === -1) {
      return beautifyText(filename.replace(/\.\w+$/, ''));
    }
    
    const captionPart = filename.substring(0, lastHyphenIndex);
    
    // Beautify the caption
    return beautifyText(captionPart);
  } catch (error) {
    console.error('Error extracting caption:', error);
    return 'No caption';
  }
}

// Helper to make text more readable
function beautifyText(text: string): string {
  return text
    .replace(/\..*$/, '') // Remove file extension if present
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
    .join(' ') || 'No caption';
} 