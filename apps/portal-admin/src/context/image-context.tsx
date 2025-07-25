"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ImageData = { file: File; previewUrl: string };

type ImageContextType = {
  images: ImageData[];
  setImages: (images: ImageData[]) => void;
  addImage: (image: ImageData) => void;
  clearImages: () => void;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<ImageData[]>([]);

  const addImage = (image: ImageData) => {
    setImages((prev) => [...prev, image]);
  };

  const clearImages = () => {
    setImages([]);
  };

  return (
    <ImageContext.Provider value={{ images, setImages, addImage, clearImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};
