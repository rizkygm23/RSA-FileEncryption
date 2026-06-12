import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export const generateKey = async () => {
    const response = await axios.get(`${API_URL}/api/generate-key`);
    return response.data;
};

export const encryptFile = async (file: File, keyFile: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', keyFile);

    const response = await axios.post(`${API_URL}/encrypt`, formData, {
        responseType: 'blob'
    });
    return response.data;
};

export const decryptFile = async (file: File, keyFile: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', keyFile);

    const response = await axios.post(`${API_URL}/decrypt`, formData, {
        responseType: 'blob'
    });
    return response.data;
};

export const signFile = async (file: File, keyFile: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', keyFile);

    const response = await axios.post(`${API_URL}/sign`, formData, {
        responseType: 'blob'
    });
    return response.data;
};

export const verifySignature = async (file: File, keyFile: File, signatureFile: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', keyFile);
    formData.append('signature', signatureFile);

    const response = await axios.post(`${API_URL}/verify`, formData);
    return response.data;
};

// Chat-specific functions
export const decryptChatText = async (encryptedContent: string, privateKey: string): Promise<string> => {
    const response = await axios.post(`${API_URL}/chat/decrypt-text`, {
        encrypted_content: encryptedContent,
        private_key: privateKey,
    });
    return response.data.decrypted_text;
};

export const verifyChatTextSignature = async (originalText: string, signature: string, publicKey: string) => {
    const response = await axios.post(`${API_URL}/chat/verify-text`, {
        original_text: originalText,
        signature: signature,
        public_key: publicKey,
    });
    return response.data;
};

export const verifyChatFileSignature = async (fileBlob: Blob, signature: string, publicKey: string) => {
    const file = new File([fileBlob], 'file');
    const sigBlob = new Blob([signature], { type: 'text/plain' });
    const sigFile = new File([sigBlob], 'signature.txt');
    const keyBlob = new Blob([publicKey], { type: 'text/plain' });
    const keyFile = new File([keyBlob], 'public_key.txt');
    return await verifySignature(file, keyFile, sigFile);
};
