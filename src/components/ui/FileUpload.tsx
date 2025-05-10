
import React, { useState, useRef } from "react";
import { Image, Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label?: string;
  accept?: string;
  previewUrl?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  label = "Upload Image",
  accept = "image/*",
  previewUrl,
}) => {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    onFileSelect(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-textile-700">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? "border-textile-500 bg-textile-50"
            : "border-textile-300 hover:border-textile-500 hover:bg-textile-50"
        }`}
      >
        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-[200px] rounded object-contain"
            />
            <p className="mt-2 text-center text-sm text-textile-500">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <>
            <Image className="mb-3 h-10 w-10 text-textile-400" />
            <p className="mb-2 text-sm font-medium text-textile-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-textile-500">
              PNG, JPG or GIF (max. 5MB)
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
