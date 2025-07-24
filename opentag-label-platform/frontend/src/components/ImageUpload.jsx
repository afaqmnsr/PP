import React, { useState, useRef } from 'react';

export default function ImageUpload({ onImageAdd }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Function to compress image
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions (max 800px width/height)
                const maxSize = 800;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8); // 80% quality
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const processFile = async (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsLoading(true);
        try {
            // Compress image if it's larger than 1MB
            let processedFile = file;
            if (file.size > 1024 * 1024) {
                console.log('Compressing large image...');
                processedFile = await compressImage(file);
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                const imageId = `image-${Date.now()}`;
                
                const imageElement = {
                    id: imageId,
                    type: 'image',
                    x: 10,
                    y: 10,
                    width: 20,
                    height: 20,
                    imageData: imageData,
                    originalWidth: 800, // Will be updated with actual dimensions
                    originalHeight: 800,
                    rotation: 0,
                    maintainAspectRatio: true
                };

                // Get actual image dimensions
                const img = new Image();
                img.onload = () => {
                    imageElement.originalWidth = img.width;
                    imageElement.originalHeight = img.height;
                    setUploadedImage(imageElement);
                    onImageAdd(imageElement);
                };
                img.src = imageData;
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="image-upload-container">
            <h3>Add Image/Logo</h3>
            
            <div 
                className={`upload-area ${isDragOver ? 'drag-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                
                <div className="file-input-label" onClick={() => fileInputRef.current?.click()}>
                    {isLoading ? (
                        <div>Processing image...</div>
                    ) : (
                        <>
                            <div>📁 Click to upload or drag & drop</div>
                            <div className="upload-hint">Supports: JPG, PNG, GIF (max 50MB)</div>
                        </>
                    )}
                </div>
            </div>

            {uploadedImage && (
                <div className="image-preview-container">
                    <div className="image-preview-info">
                        <h4>Uploaded Image</h4>
                        <p>Size: {uploadedImage.originalWidth} × {uploadedImage.originalHeight}px</p>
                        <button onClick={removeImage} className="remove-image-btn">
                            Remove Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 