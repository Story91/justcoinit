"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "./DemoComponents";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setPermissionDenied(false);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermissionDenied(true);
        setErrorMessage("Camera access denied. Please allow camera access in your browser settings.");
      } else {
        setErrorMessage(`Could not access camera: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {errorMessage && (
        <div className="p-4 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
          {errorMessage}
        </div>
      )}

      {permissionDenied ? (
        <div className="p-4 text-center">
          <p className="mb-4">Camera access is required to capture images.</p>
          <Button onClick={startCamera}>Try Again</Button>
        </div>
      ) : (
        <>
          <div className="relative w-full overflow-hidden rounded-lg bg-gray-100 aspect-square">
            {!cameraActive ? (
              <div className="flex items-center justify-center w-full h-full">
                <Button onClick={startCamera}>Start Camera</Button>
              </div>
            ) : (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          
          {cameraActive && (
            <div className="flex space-x-4">
              <Button onClick={captureImage}>Take Photo</Button>
              <Button onClick={stopCamera} variant="secondary">Cancel</Button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
} 