
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      } else {
        alert('Format not supported. Please upload an image.');
      }
    }
  }, [onImageSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onImageSelected(file);
    }
  }, [onImageSelected]);

  return (
    <div className="relative group w-full max-w-xl mx-auto animate-fade-in">
      
      <div 
        className={`
          relative w-full bg-zen-paper border border-zinc-700 p-16
          flex flex-col items-center justify-center cursor-pointer transition-all duration-500
          shadow-2xl
          ${isDragging ? 'bg-zinc-800 border-zen-accent scale-[1.02]' : 'hover:bg-zinc-800 hover:border-zinc-500'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer z-10">
          
          {/* Icon */}
          <div className={`mb-6 transition-transform duration-500 ${isDragging ? '-translate-y-2' : ''}`}>
             <div className="w-16 h-16 border border-zinc-600 flex items-center justify-center rotate-45 bg-zinc-900">
                <UploadIcon className="w-6 h-6 text-zinc-400 -rotate-45" />
             </div>
          </div>
          
          <h3 className="text-xl font-serif font-bold text-zinc-200 mb-3 tracking-widest uppercase">
            Upload Image
          </h3>
          
          <div className="font-sans text-xs text-zinc-500 mb-8 text-center tracking-wide">
            Drop your file here or click to browse<br/>
            <span className="italic opacity-60">Manga • Anime • Manhwa</span>
          </div>

          <div className="px-8 py-2 border-b border-zen-accent text-zen-accent font-sans text-xs font-bold uppercase tracking-widest hover:text-white hover:border-white transition-colors">
            Select File
          </div>
          
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileInput}
          />
        </label>

        {/* Decorative Corners (Japanese Style) */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-zinc-700"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-zinc-700"></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-zinc-700"></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-zinc-700"></div>
      </div>
    </div>
  );
};

export default ImageUploader;