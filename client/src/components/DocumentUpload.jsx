import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { validateFileSize, validateFileType } from '../utils/validation';
import { formatFileSize } from '../utils/formatters';
import { ButtonLoader } from './LoadingSpinner';

/**
 * DocumentUpload - Enhanced component for uploading documents to grievances
 * @param {Object} props - Component props
 * @param {number} props.grievanceId - ID of the grievance
 * @param {Function} props.onUploadSuccess - Callback when upload succeeds
 * @param {Function} props.onUploadError - Callback when upload fails
 */
const DocumentUpload = ({ grievanceId, onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const handleFileSelect = (file) => {
    setError('');

    // Validate file size
    const sizeValidation = validateFileSize(file, 10);
    if (!sizeValidation.isValid) {
      setError(sizeValidation.message);
      return;
    }

    // Validate file type
    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.isValid) {
      setError(typeValidation.message);
      return;
    }

    setSelectedFile(file);
    setLabel(file.name);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!label.trim()) {
      setError('Please provide a label for the document');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('label', label);
      formData.append('description', description);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${grievanceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Reset form
      setSelectedFile(null);
      setLabel('');
      setDescription('');
      setPreview(null);

      if (onUploadSuccess) {
        onUploadSuccess(data.document);
      }
    } catch (err) {
      const errorMessage = 'Failed to upload document. Please try again.';
      setError(errorMessage);

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setLabel('');
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload Document
      </h3>

      <form onSubmit={handleUpload}>
        {/* File Drop Zone */}
        {!selectedFile && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

            <p className="text-sm font-medium text-gray-900 mb-1">
              Drop your file here, or click to browse
            </p>

            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPEG, PNG, DOC, DOCX, TXT (Max 10MB)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={allowedTypes.join(',')}
              className="hidden"
            />
          </div>
        )}

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Preview */}
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                  <File className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  <span>File selected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Label Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Label *
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Time Card, Email Evidence, Photo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional details about this document"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="submit"
          disabled={!selectedFile || uploading}
          className={`
            w-full px-4 py-2 rounded-lg font-medium transition-colors
            flex items-center justify-center gap-2
            ${selectedFile && !uploading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {uploading && <ButtonLoader />}
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;
