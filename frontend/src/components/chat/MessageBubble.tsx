'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Message, ChatRoom, MessageRecipient } from '@/lib/supabase';
import { decryptFile, decryptChatText, verifyChatTextSignature, verifyChatFileSignature } from '@/services/api';
import { Check, CheckCheck, Download, Eye, FileImage, FileText, Loader2, Paperclip } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  users: User[];
  room: ChatRoom;
  recipients?: MessageRecipient[];
}

export default function MessageBubble({ message, currentUser, users, room, recipients }: MessageBubbleProps) {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecryptingText, setIsDecryptingText] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);

  const sender = users.find(u => u.id === message.sender_id);
  const isOwnMessage = message.sender_id === currentUser.id;

  const hasDecrypted = useRef(false);

  // Auto-decrypt text messages + verify signature silently
  useEffect(() => {
    if (message.message_type !== 'text' || hasDecrypted.current) return;
    hasDecrypted.current = true;

    const decryptText = async () => {
      try {
        setIsDecryptingText(true);
        const decryptedText = await decryptChatText(
          message.encrypted_content,
          room.private_key
        );
        setDecryptedContent(decryptedText);

        // Silent signature verification
        try {
          const result = await verifyChatTextSignature(decryptedText, message.signature, room.public_key);
          setSignatureValid(result.valid);
        } catch (sigErr) {
          console.error('Signature verification error:', sigErr);
          setSignatureValid(false);
        }
      } catch (error: unknown) {
        console.error('Decryption error:', error);
        const messageText = error instanceof Error ? error.message : 'Failed to decrypt';
        setDecryptedContent(`Error: ${messageText}`);
      } finally {
        // Always reset loading state even if component unmounted
        setIsDecryptingText(false);
      }
    };

    decryptText();
  }, [message.id, message.encrypted_content, message.message_type, message.signature, room.private_key, room.public_key]);

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

  const verifyFileSigSilently = async (decryptedBlob: Blob) => {
    try {
      const result = await verifyChatFileSignature(decryptedBlob, message.signature, room.public_key);
      setSignatureValid(result.valid);
    } catch (e) {
      console.error('File signature verification error:', e);
      setSignatureValid(false);
    }
  };

  const handleOpenFile = async () => {
    try {
      setIsOpening(true);
      const decryptedBlob = await decryptFileData();
      
      // Silent signature verification
      await verifyFileSigSilently(decryptedBlob);
      
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
      
      // Silent signature verification
      await verifyFileSigSilently(decryptedBlob);
      
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

  const getReadStatus = () => {
    if (!recipients || recipients.length === 0) {
      return 'sent';
    }
    const allRead = recipients.every((r) => r.is_read);
    return allRead ? 'read' : 'delivered';
  };

  const renderCheckmarks = () => {
    if (!isOwnMessage) return null;
    const status = getReadStatus();
    if (status === 'sent') {
      return <Check className="h-3 w-3 text-[#afafaf]" />;
    }
    if (status === 'delivered') {
      return <CheckCheck className="h-3 w-3 text-[#afafaf]" />;
    }
    return <CheckCheck className="h-3 w-3 text-white" />;
  };

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

        {/* Timestamp + Read Status */}
        <div className={`flex items-center justify-between border-t px-3 pb-2 pt-1 ${isOwnMessage ? 'border-white/10' : 'border-black/5'}`}>
          <div className={`text-xs ${isOwnMessage ? 'text-[#afafaf]' : 'text-[#5e5e5e]'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          {renderCheckmarks()}
        </div>
      </div>
    </div>
  );
}
