'use client';

import { useEffect, useState } from 'react';
import { User, Message, ChatRoom } from '@/lib/supabase';
import { decryptFile, decryptChatText } from '@/services/api';
import { Check, Download, Eye, FileImage, FileText, Loader2, Paperclip } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  users: User[];
  room: ChatRoom;
}

export default function MessageBubble({ message, currentUser, users, room }: MessageBubbleProps) {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecryptingText, setIsDecryptingText] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const sender = users.find(u => u.id === message.sender_id);
  const isOwnMessage = message.sender_id === currentUser.id;

  // Auto-decrypt text messages
  useEffect(() => {
    let isMounted = true;

    const decryptText = async () => {
      if (message.message_type !== 'text' || decryptedContent) return;

      try {
        setIsDecryptingText(true);
        const decryptedText = await decryptChatText(
          message.encrypted_content,
          room.private_key
        );
        if (isMounted) setDecryptedContent(decryptedText);
      } catch (error: unknown) {
        console.error('Decryption error:', error);
        const messageText = error instanceof Error ? error.message : 'Failed to decrypt';
        if (isMounted) setDecryptedContent(`Error: ${messageText}`);
      } finally {
        if (isMounted) setIsDecryptingText(false);
      }
    };

    decryptText();

    return () => {
      isMounted = false;
    };
  }, [decryptedContent, message.encrypted_content, message.message_type, message.id, room.private_key]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error';
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
    } catch (error: unknown) {
      console.error('Open error:', error);
      alert(`Failed to open: ${getErrorMessage(error)}`);
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
    } catch (error: unknown) {
      console.error('Download error:', error);
      alert(`Failed to download: ${getErrorMessage(error)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const fileName = message.file_name ?? 'Encrypted file';
  const fileSize = message.file_size ?? 0;
  const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = fileName.match(/\.pdf$/i);
  const FileIcon = isImage ? FileImage : isPDF ? FileText : Paperclip;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 px-2 sm:px-0`}>
      <div className={`max-w-[85%] overflow-hidden rounded-2xl border sm:max-w-md lg:max-w-lg ${
        isOwnMessage ? 'border-black bg-black text-white' : 'border-[#e2e2e2] bg-white text-black'
      }`}>
        {!isOwnMessage && (
          <div className="px-3 pt-2 pb-1">
            <div className="text-xs font-medium text-[#5e5e5e]">{sender?.display_name}</div>
          </div>
        )}
        
        {message.message_type === 'text' ? (
          <div className="px-3 py-2">
            {isDecryptingText ? (
              <div className={`flex items-center gap-2 text-xs ${isOwnMessage ? 'text-[#efefef]' : 'text-[#5e5e5e]'}`}>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Decrypting...</span>
              </div>
            ) : decryptedContent ? (
              <p className={`whitespace-pre-wrap break-words text-sm ${isOwnMessage ? 'text-white' : 'text-black'}`}>{decryptedContent}</p>
            ) : (
              <p className={`text-xs font-medium ${isOwnMessage ? 'text-[#efefef]' : 'text-black'}`}>Failed to decrypt</p>
            )}
          </div>
        ) : (
          <div>
            {/* Preview Section */}
            {showPreview && previewUrl && (
              <div className="relative">
                {isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={previewUrl} 
                    alt={fileName}
                    className="w-full max-h-96 object-contain bg-[#efefef]"
                  />
                )}
                {isPDF && (
                  <iframe 
                    src={previewUrl}
                    className="w-full h-96 bg-white"
                    title={fileName}
                  />
                )}
              </div>
            )}

            {/* File Info */}
            <div className="px-3 py-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  isOwnMessage ? 'bg-white text-black' : 'bg-[#efefef] text-[#5e5e5e]'
                }`}>
                  <FileIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`truncate text-sm font-semibold ${isOwnMessage ? 'text-white' : 'text-black'}`}>{fileName}</div>
                  <div className={`text-xs ${isOwnMessage ? 'text-[#afafaf]' : 'text-[#5e5e5e]'}`}>
                    {(fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {(isImage || isPDF) && (
                  <button
                    onClick={handleOpenFile}
                    disabled={isOpening || isDownloading || showPreview}
                    className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                      isOwnMessage ? 'bg-white text-black hover:bg-[#efefef]' : 'bg-black text-white hover:bg-[#282828]'
                    }`}
                  >
                    {isOpening ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Opening...</span>
                      </>
                    ) : showPreview ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Opened</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isOpening || isDownloading}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    isOwnMessage
                      ? 'border-white bg-black text-white hover:bg-[#282828]'
                      : 'border-[#e2e2e2] bg-[#efefef] text-black hover:bg-[#e2e2e2]'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`border-t px-3 pb-2 pt-1 ${isOwnMessage ? 'border-white/10' : 'border-black/5'}`}>
          <div className={`text-xs ${isOwnMessage ? 'text-[#afafaf]' : 'text-[#5e5e5e]'}`}>
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
