"use client";

import { useState, useRef } from "react";
import { Button } from "./DemoComponents";
import { CameraCapture } from "./CameraCapture";

interface ImageUploaderProps {
  onImageCaptured: (imageUrl: string, caption: string) => void;
  onCancel: () => void;
}

export function ImageUploader({ onImageCaptured, onCancel }: ImageUploaderProps) {
  const [step, setStep] = useState<"initial" | "camera" | "file" | "caption">("initial");
  const [imageData, setImageData] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraSelect = () => {
    setStep("camera");
    setUploadError(null);
  };

  const handleFileSelect = () => {
    setStep("file");
    setUploadError(null);
  };

  const handleImageCapture = (capturedImageData: string) => {
    setImageData(capturedImageData);
    setStep("caption");
    setUploadError(null);
    
    // Generate a default file name for camera captures
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    setFileName(`camera-capture-${timestamp}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageData(event.target.result);
        setStep("caption");
      }
    };
    reader.readAsDataURL(file);
  };

  const getFileTypeFromDataUrl = (dataUrl: string): string => {
    // Extract MIME type from data URL
    const match = dataUrl.match(/^data:([^;]+);/);
    return match ? match[1] : 'image/jpeg'; // Default to JPEG if no match
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error('Error converting data URL to blob:', error);
      throw new Error('Failed to process image');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageData || !caption.trim()) {
      setUploadError('Both image and caption are required');
      return;
    }
    
    try {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(10);
      
      // Generate a clean filename from the caption
      const safeFileName = caption.trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .toLowerCase();
      
      // Ensure we don't exceed length limits
      const truncatedName = safeFileName.substring(0, 30);
      
      try {
        // Convert base64 image to blob
        const imageBlob = dataURLtoBlob(imageData);
        const imageType = getFileTypeFromDataUrl(imageData);
        
        // Determine file extension from mime type
        const extension = imageType.split('/')[1] || 'jpg';
        const finalFileName = `${truncatedName}-${Date.now()}.${extension}`;
        
        // Create form data
        const formData = new FormData();
        formData.append('file', imageBlob, finalFileName);
        formData.append('filename', finalFileName);
        formData.append('caption', caption);
        
        setUploadProgress(30);
        
        // Upload to Vercel Blob Storage
        const response = await fetch('/api/blob', {
          method: 'POST',
          body: formData,
        });
        
        setUploadProgress(80);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'Failed to upload image');
        }
        
        const result = await response.json();
        setUploadProgress(100);
        
        // Pass the URL to the parent component
        onImageCaptured(result.url, caption);
      } catch (error) {
        console.error('Error processing image:', error);
        setUploadError(error instanceof Error ? error.message : 'Error processing image');
        setUploadProgress(0);
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  // Funkcja intent - przygotowuje zamiar udostępnienia zdjęcia
  const prepareShareIntent = () => {
    if (!imageData) return;
    
    // W prawdziwej implementacji, wysłalibyśmy to do API Farcaster
    // np. przy użyciu funkcji framecaster.addIntent('share')
    console.log("Share intent prepared with image:", imageData);
    
    const message = `Check out my new photo in JustCoinIt! "${caption}"`;
    
    // W Farcaster miniapp moglibyśmy użyć API Intents
    // Symulacja wywołania Farcaster intent
    alert(`Intent would be triggered with message: ${message}`);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 rounded-lg shadow">
      {step === "initial" && (
        <>
          <h3 className="text-lg font-medium mb-4">Dodaj nowe zdjęcie</h3>
          <div className="space-y-3">
            <Button 
              onClick={handleCameraSelect} 
              className="w-full"
              variant="primary"
            >
              Zrób zdjęcie kamerą
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full"
            >
              Wybierz zdjęcie z galerii
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden" 
            />
            <Button 
              onClick={onCancel} 
              className="w-full"
              variant="secondary"
            >
              Anuluj
            </Button>
          </div>
        </>
      )}

      {step === "camera" && (
        <CameraCapture onCapture={handleImageCapture} />
      )}

      {step === "caption" && imageData && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Dodaj opis</h3>
          
          <div className="w-full h-64 bg-gray-200 mb-3 rounded overflow-hidden">
            <img 
              src={imageData} 
              alt="Captured" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div>
            <label htmlFor="caption" className="block text-sm font-medium mb-1">
              Opis
            </label>
            <textarea
              id="caption"
              placeholder="Napisz coś o tym zdjęciu..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>
          
          {uploadError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
              {uploadError}
            </div>
          )}
          
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-1 text-gray-500">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={!caption.trim() || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Publikowanie...' : 'Opublikuj'}
            </Button>
            <Button
              type="button"
              onClick={prepareShareIntent}
              disabled={!caption.trim() || isUploading}
              variant="secondary"
              className="flex-1"
            >
              Udostępnij (intent)
            </Button>
          </div>
          
          <Button
            type="button"
            onClick={() => setStep("initial")}
            variant="secondary"
            className="w-full"
            disabled={isUploading}
          >
            Wróć
          </Button>
        </form>
      )}
    </div>
  );
} 