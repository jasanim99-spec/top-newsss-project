import React, { useState } from 'react';
import { Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { storageService } from '@/services/storageService';
import toast from 'react-hot-toast';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileUpload?: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  accept?: string;
  label?: string;
  folder?: string;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  onFileUpload,
  accept = "image/*",
  label = "Cover Image",
  folder = "news",
  maxSizeMB = 50
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useDirectUrl, setUseDirectUrl] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return;
    }

    const uploader = onFileUpload || ((f: File, prog: (p: number) => void) => storageService.uploadNewsImage(f, folder + '_' + Date.now(), prog));

    setUploading(true);
    setProgress(0);

    try {
      const url = await uploader(file, (p) => setProgress(p));
      onChange(url);
      toast.success(`${label} uploaded to Firebase Storage successfully!`);
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(error.message || `Failed to upload ${label.toLowerCase()}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => setUseDirectUrl(false)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            !useDirectUrl ? 'bg-blue-50 text-blue-600 border-blue-200' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload to Storage
        </button>
        <button
          type="button"
          onClick={() => setUseDirectUrl(true)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            useDirectUrl ? 'bg-blue-50 text-blue-600 border-blue-200' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          Direct URL
        </button>
      </div>

      {!useDirectUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
            disabled={uploading}
          />
          <label htmlFor={`file-${label.replace(/\s+/g, '-').toLowerCase()}`} className="cursor-pointer block">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              {uploading ? `Uploading ${label}... (${progress}%)` : `Click to upload ${label.toLowerCase()}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max size: {maxSizeMB}MB
            </p>
          </label>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      ) : (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()} URL`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      )}

      {value && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview:</p>
          {accept.includes('video') ? (
            <video src={value} controls className="max-h-48 rounded-lg border bg-black w-full" />
          ) : (
            <img src={value} alt="Preview" className="h-36 object-cover rounded-lg border" />
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;