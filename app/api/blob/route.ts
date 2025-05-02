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

    const filename = formData.get('filename') as string || file.name;
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer]);
    
    const { url } = await put(`uploads/${filename}`, blob, {
      access: 'public',
    });

    return NextResponse.json({ success: true, url });
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