'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import config from '@/config';
import { fetchWithAuth } from '../lib/api';

interface Document {
  id: string;
  date: string;
  kind: string;
  text: string;
  tags: string[];
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  thumbnailUrl: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual data from Firebase
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      date: '2024-12-24',
      kind: 'Invoice',
      text: 'Monthly subscription invoice for cloud services',
      tags: ['finance', 'cloud', 'subscription'],
      status: 'Completed',
      thumbnailUrl: 'https://picsum.photos/200/300',
    },
    {
      id: '2',
      date: '2024-12-23',
      kind: 'Receipt',
      text: 'Office supplies purchase receipt',
      tags: ['expense', 'office'],
      status: 'Processing',
      thumbnailUrl: 'https://picsum.photos/200/300',
    },
  ]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Convert FileList to Array for proper TypeScript iteration
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);

        // Add user token if user is logged in
        if (user) {
          const token = await user.getIdToken();
          formData.append('token', token);
        }

        const xhr = new XMLHttpRequest();
        const fileId = Date.now().toString();

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress
            }));
          }
        };

        // Create a promise to handle the XHR request
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error('Invalid response format'));
              }
            } else {
              reject(new Error('Upload failed'));
            }
          };
          xhr.onerror = () => reject(new Error('Network error'));
        });

        // Start the upload
        xhr.open('POST', config.api.upload);
        xhr.send(formData);

        // Wait for the upload to complete
        const result = await uploadPromise;

        // Add the new document to the list
        const newDocument: Document = {
          id: fileId,
          date: new Date().toISOString().split('T')[0],
          kind: 'Pending',
          text: file.name,
          tags: [],
          status: 'Processing',
          thumbnailUrl: URL.createObjectURL(file), // Show local preview until real URL is available
        };

        setDocuments(prev => [newDocument, ...prev]);

        // Clean up the progress state
        setUploadProgress(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file(s). Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate total upload progress
  const totalProgress = Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / 
    (Object.keys(uploadProgress).length || 1);

  return (
    <div className="flex flex-col h-screen">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />

      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Documents</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-1 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{Math.round(totalProgress)}%</span>
                </div>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Upload</span>
                </>
              )}
            </button>

            <button
              onClick={async () => {
                const { data, error } = await fetchWithAuth('http://127.0.0.1:5001/boringketo/us-central1/hello2', {
                  method: 'POST',
                  body: { test: true }
                });

                if (error) {
                  console.error('Test failed:', error);
                  alert('Test failed: ' + error);
                } else {
                  console.log('Test succeeded:', data);
                  alert('Test succeeded!');
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-2"
            >
              Test TestTestTestTest
            </button>
          </div>
        </div>
      </header>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="w-24 px-4 py-3 text-left text-sm font-medium text-gray-600">Thumbnail</th>
              <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-600">Kind</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Text</th>
              <th className="w-48 px-4 py-3 text-left text-sm font-medium text-gray-600">Tags</th>
              <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="w-24 px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    <Image
                      src={doc.thumbnailUrl}
                      alt={doc.kind}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{doc.date}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {doc.kind}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm line-clamp-2">{doc.text}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    doc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    doc.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    doc.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
