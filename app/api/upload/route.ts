import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contentType = formData.get('contentType') as string || file.type;
    const filename = formData.get('filename') as string || file.name;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Obsługa różnych typów plików (obraz, wideo, JSON)
    let blob;
    if (contentType === 'application/json') {
      // Dla metadanych JSON
      blob = await put(filename, file, {
        contentType,
        access: 'public',
        addRandomSuffix: true,
      });
    } else {
      // Dla obrazów i wideo
      blob = await put(filename, file, {
        contentType,
        access: 'public',
        addRandomSuffix: true,
      });
    }

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 