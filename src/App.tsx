import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, Trash2 } from 'lucide-react';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!image) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      // Convert base64 to blob
      const base64Response = await fetch(image);
      const blob = await base64Response.blob();
      formData.append('image_file', blob);

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'gwfCawaDcZEBjSzyfx4YTYUC',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to remove background');
      }

      const blob2 = await response.blob();
      const url = URL.createObjectURL(blob2);
      setProcessedImage(url);
    } catch (err) {
      setError('Failed to remove background. Please try again.');
      console.error('Error removing background:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImages = () => {
    setImage(null);
    setProcessedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Background Remover
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your image and let our AI-powered tool remove the background instantly.
            Get professional-looking results in seconds.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          {!image ? (
            // Upload Section
            <div
              className={`border-4 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
                className="hidden"
              />
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                Drag & Drop your image here
              </h3>
              <p className="text-gray-500 mb-4">
                or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Files
              </button>
            </div>
          ) : (
            // Image Processing Section
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original Image */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Original Image
                  </h3>
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Processed Image */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Processed Image
                  </h3>
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAOdEVYdFRpdGxlAENoZWNrZXJz+KSWfAAAACxJREFUOI1j/P///38GKgAmaobBYjADIyMjVC8xYIB8MBqN0WhkxEYPNIMAACkGDf8Hk1mxAAAAAElFTkSuQmCC')]">
                    {processedImage && (
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-center font-medium">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors
                    ${isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'} 
                    text-white`}
                >
                  {isProcessing ? 'Processing...' : 'Remove Background'}
                </button>
                {processedImage && (
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = processedImage;
                      link.download = 'processed-image.png';
                      link.click();
                    }}
                    className="flex items-center px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                )}
                <button
                  onClick={resetImages}
                  className="flex items-center px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
            <p className="text-gray-600">
              Remove backgrounds from your images in seconds with our advanced AI technology.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">High Quality</h3>
            <p className="text-gray-600">
              Get professional-quality results with precise edge detection and smooth transitions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600">
              Simple drag-and-drop interface makes it easy to upload and process your images.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;