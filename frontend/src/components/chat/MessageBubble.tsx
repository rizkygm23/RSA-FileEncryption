'use client';

import { useState, useEffect } from 'react';
import { User, Message, ChatRoom } from '@/lib/supabase';
import { decryptFile, decryptChatText } from '@/services/api';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  users: User[];
  room: ChatRoom;
}

export default function MessageBubble({ message, currentUser, users, room }: MessageBubbleProps) {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const sender = users.find(u => u.id === message.sender_id);
  const isOwnMessage = message.sender_id === currentUser.id;

  // Auto-decrypt text messages
  useEffect(() => {
    if (message.message_type === 'text' && !decryptedContent && !isOpening) {
      handleDecryptText();
    }
  }, [message.id]);

  const handleDecryptText = async () => {
    try {
      setIsOpening(true);
      const decryptedText = await decryptChatText(
        message.encrypted_content,
        room.private_key
      );
      setDecryptedContent(decryptedText);
    } catch (error: any) {
      console.error('Decryption error:', error);
      setDecryptedContent(`Error: ${error.message || 'Failed to decrypt'}`);
    } finally {
      setIsOpening(false);
    }
  };

  const decryptFileData = async () => {
    if (!message.file_url) {
      throw new Error('File URL not found');
    }

    const response = await fetch(message.file_url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    
    const encryptedBlob = await response.blob();
    const blobText = await encryptedBlob.text();
    
    if (blobText.startsWith('{') && blobText.includes('statusCode')) {
      throw new Error('File not found in storage');
    }
    
    const encryptedFile = new File([blobText], 'encrypted_file', { type: 'text/plain' });
    const privateKeyBlob = new Blob([room.private_key], { type: 'text/plain' });
    const privateKeyFile = new File([privateKeyBlob], 'private_key.txt');

    return await decryptFile(encryptedFile, privateKeyFile);
  };

  const handleOpenFile = async () => {
    try {
      setIsOpening(true);
      const decryptedBlob = await decryptFileData();
      
      // Create preview URL
      const url = window.URL.createObjectURL(decryptedBlob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error: any) {
      console.error('Open error:', error);
      alert(`Failed to open: ${error.message}`);
    } finally {
      setIsOpening(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const decryptedBlob = await decryptFileData();
      
      // Download file
      const url = window.URL.createObjectURL(decryptedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = message.file_name || 'decrypted_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`Failed to download: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const isImage = message.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = message.file_name?.match(/\.pdf$/i);

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-md ${isOwnMessage ? 'bg-zinc-800' : 'bg-zinc-800/50'} rounded-lg overflow-hidden border ${isOwnMessage ? 'border-zinc-700' : 'border-zinc-700/50'}`}>
        {!isOwnMessage && (
          <div className="px-3 pt-2 pb-1">
            <div className="text-xs text-zinc-400 font-medium">{sender?.display_name}</div>
          </div>
        )}
        
        {message.message_type === 'text' ? (
          <div className="px-3 py-2">
            {isOpening ? (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <div className="w-3 h-3 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : decryptedContent ? (
              <p className="text-white text-sm whitespace-pre-wrap break-words">{decryptedContent}</p>
            ) : (
              <p className="text-zinc-500 text-sm">Failed to decrypt</p>
            )}
          </div>
        ) : (
          <div>
            {/* Preview Section */}
            {showPreview && previewUrl && (
              <div className="relative">
                {isImage && (
                  <img 
                    src={previewUrl} 
                    alt={message.file_name}
                    className="w-full max-h-96 object-contain bg-zinc-950"
                  />
                )}
                {isPDF && (
                  <iframe 
                    src={previewUrl}
                    className="w-full h-96 bg-zinc-950"
                    title={message.file_name}
                  />
                )}
              </div>
            )}

            {/* File Info */}
            <div className="px-3 py-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
                  {isImage ? (
                    <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : isPDF ? (
                    <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{message.file_name}</div>
                  <div className="text-zinc-500 text-xs">
                    {(message.file_size! / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {(isImage || isPDF) && (
                  <button
                    onClick={handleOpenFile}
                    disabled={isOpening || isDownloading || showPreview}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-black disabled:text-zinc-500 text-sm font-medium py-2 px-3 rounded transition"
                  >
                    {isOpening ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-black rounded-full animate-spin"></div>
                        <span>Opening...</span>
                      </>
                    ) : showPreview ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Opened</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Buka</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isOpening || isDownloading}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white disabled:text-zinc-600 text-sm font-medium py-2 px-3 rounded transition"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="px-3 pb-2">
          <div className="text-xs text-zinc-600">
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
