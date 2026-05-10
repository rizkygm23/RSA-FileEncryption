# Bug Fix: Chat Message Decryption Error

## Problem

Error saat decrypt chat message:
```
ValueError: invalid literal for int() with base 10: '{"statusCode":"404"'
```

## Root Cause

Backend endpoint `/decrypt` mengharapkan **file upload** dengan format:
- `file`: encrypted file
- `key`: private key file

Tapi chat messages mengirim **encrypted text string** langsung (bukan file), sehingga:
1. Frontend membuat Blob dari encrypted string
2. Backend mencoba parse sebagai comma-separated integers
3. Jika ada error (misal: file tidak ditemukan di Supabase), backend menerima JSON error
4. Backend crash karena tidak bisa parse JSON sebagai integers

## Solution

### 1. Tambah Endpoint Baru untuk Chat

**Backend (`app.py`):**
```python
@app.route('/chat/decrypt-text', methods=['POST'])
def decrypt_chat_text():
    """Decrypt text message from chat"""
    data = request.get_json()
    encrypted_content = data.get('encrypted_content')
    private_key = data.get('private_key')
    
    # Parse and decrypt
    pk = parse_key(private_key, 'private')
    encrypted_data = [int(x) for x in encrypted_content.split(',') if x]
    decrypted_bytes = decrypt(pk, encrypted_data)
    
    return jsonify({
        'decrypted_text': decrypted_bytes.decode('utf-8')
    })
```

**Keuntungan:**
- ✅ Tidak perlu create File objects
- ✅ Langsung kirim string via JSON
- ✅ Lebih efisien untuk text messages
- ✅ Error handling lebih baik

### 2. Update Service API

**Frontend (`services/api.ts`):**
```typescript
export const decryptChatText = async (
  encryptedContent: string, 
  privateKey: string
): Promise<string> => {
    const response = await axios.post(`${API_URL}/chat/decrypt-text`, {
        encrypted_content: encryptedContent,
        private_key: privateKey,
    });
    return response.data.decrypted_text;
};
```

### 3. Update MessageBubble Component

**Frontend (`MessageBubble.tsx`):**
```typescript
if (message.message_type === 'text') {
    // Use new endpoint
    const decryptedText = await decryptChatText(
        message.encrypted_content,
        room.private_key
    );
    setDecryptedContent(decryptedText);
}
```

## Comparison

### ❌ Old Way (File-based)
```typescript
// Create Blob from string
const blob = new Blob([encrypted_content]);
const file = new File([blob], 'encrypted.txt');

// Upload as FormData
const formData = new FormData();
formData.append('file', file);
formData.append('key', keyFile);

// Backend expects file format
const response = await axios.post('/decrypt', formData);
```

**Problems:**
- Overhead creating File objects
- Backend expects specific file format
- Error when content is not valid encrypted data

### ✅ New Way (JSON-based)
```typescript
// Direct JSON request
const response = await axios.post('/chat/decrypt-text', {
    encrypted_content: encrypted_string,
    private_key: key_string,
});
```

**Benefits:**
- Simpler and faster
- Better error handling
- Designed for chat use case

## Testing

### 1. Restart Backend
```bash
cd backend
# Stop backend (Ctrl+C)
python app.py
```

### 2. Test Text Message
1. Login as User A
2. Create chat with User B
3. Send text message: "Hello World"
4. Click "Decrypt"
5. Should show: "Hello World" ✅

### 3. Test File Message
1. Click 📎 to attach file
2. Send file
3. Click "Download & Decrypt"
4. File should download ✅

## Error Handling

New endpoint includes better error handling:

```python
try:
    # Decrypt logic
    return jsonify({'decrypted_text': text})
except Exception as e:
    return jsonify({'error': str(e)}), 500
```

Frontend shows user-friendly error:
```typescript
catch (error: any) {
    alert(`Failed to decrypt: ${error.message}`);
}
```

## Files Changed

1. ✅ `backend/app.py` - Added `/chat/decrypt-text` endpoint
2. ✅ `frontend/src/services/api.ts` - Added `decryptChatText()` function
3. ✅ `frontend/src/components/chat/MessageBubble.tsx` - Use new endpoint

## Migration Notes

**No database changes needed!**

This is purely a backend/frontend API change. Existing encrypted messages will work with the new endpoint.

## Future Improvements

1. **Batch Decryption**: Decrypt multiple messages at once
2. **Caching**: Cache decrypted messages in memory
3. **Auto-decrypt**: Option to auto-decrypt on receive
4. **Streaming**: For large files, use streaming decryption

## Summary

- ✅ Fixed: Text message decryption error
- ✅ Added: Dedicated chat decryption endpoint
- ✅ Improved: Error handling and user feedback
- ✅ Maintained: File decryption still works
- ✅ No breaking changes: Existing data compatible
