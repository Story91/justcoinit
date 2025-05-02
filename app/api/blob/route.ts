import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Extract components for better file naming
    let filename = formData.get('filename') as string || file.name;
    const imageName = formData.get('imageName') as string || '';
    const caption = formData.get('caption') as string || '';
    const contentType = file.type || 'application/octet-stream';
    
    // Make sure we preserve the file extension
    const fileExtension = getFileExtension(file.name);
    if (!filename.endsWith(fileExtension)) {
      filename = `${filename}${fileExtension}`;
    }
    
    // Create a clean name for storage
    const cleanName = sanitizeFileName(filename);
    
    // Create storage path with timestamp to prevent collisions and better organization
    const timestamp = Date.now();
    // Use the image name as the main part of the filename
    const storageKey = `uploads/images/${timestamp}-${sanitizeFileName(imageName || 'unnamed')}${fileExtension}`;
    
    // Convert file to blob
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: contentType });
    
    // Upload to Vercel Blob 
    // Note: Vercel Blob Storage doesn't support custom metadata
    const { url } = await put(storageKey, blob, {
      access: 'public',
      contentType
    });

    return NextResponse.json({ 
      success: true, 
      url,
      filename: cleanName,
      imageName: imageName || undefined,
      contentType,
      caption: caption || undefined
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

// Helper function to sanitize a filename
function sanitizeFileName(filename: string): string {
  // Remove any path information
  let cleanName = filename.replace(/^.*[\\\/]/, '');
  
  // Replace spaces with hyphens and remove special characters
  cleanName = cleanName
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]/g, '')
    .toLowerCase();
  
  return cleanName;
} 