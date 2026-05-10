import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rsa_utils import generate_keypair, encrypt, decrypt
from signature_utils import sign_file, verify_signature

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ENCRYPTED_FOLDER = 'encrypted'
DECRYPTED_FOLDER = 'decrypted'
KEYS_FOLDER = 'keys'
SIGNATURES_FOLDER = 'signatures'

for folder in [UPLOAD_FOLDER, ENCRYPTED_FOLDER, DECRYPTED_FOLDER, KEYS_FOLDER, SIGNATURES_FOLDER]:
    os.makedirs(folder, exist_ok=True)

@app.route('/generate-key', methods=['GET'])
def generate_key():
    # Use p=61, q=53 for simplicity as per project.md (n=3233)
    public, private = generate_keypair(61, 53)
    
    pub_path = os.path.join(KEYS_FOLDER, 'public_key.txt')
    priv_path = os.path.join(KEYS_FOLDER, 'private_key.txt')
    
    with open(pub_path, 'w') as f:
        f.write(f"n = {public[1]}\ne = {public[0]}")
        
    with open(priv_path, 'w') as f:
        f.write(f"n = {private[1]}\nd = {private[0]}")
        
    return send_file(pub_path, as_attachment=True) # Usually keys are returned via json, but for files we can also download them
    # Since we need to download both, we can zip them or just return json so frontend can create files.
    # We will return json containing both keys.
    
@app.route('/api/generate-key', methods=['GET'])
def api_generate_key():
    public, private = generate_keypair(61, 53)
    return jsonify({
        'public_key': f"n = {public[1]}\ne = {public[0]}",
        'private_key': f"n = {private[1]}\nd = {private[0]}"
    })

def parse_key(key_content, key_type):
    lines = key_content.strip().split('\n')
    n = int(lines[0].split('=')[1].strip())
    if key_type == 'public':
        e = int(lines[1].split('=')[1].strip())
        return (e, n)
    else:
        d = int(lines[1].split('=')[1].strip())
        return (d, n)

@app.route('/encrypt', methods=['POST'])
def encrypt_file():
    if 'file' not in request.files or 'key' not in request.files:
        return jsonify({'error': 'File and key are required'}), 400
        
    file = request.files['file']
    key_file = request.files['key']
    
    key_content = key_file.read().decode('utf-8')
    try:
        pk = parse_key(key_content, 'public')
    except Exception as e:
        return jsonify({'error': 'Invalid public key format'}), 400
        
    file_bytes = file.read()
    encrypted_data = encrypt(pk, file_bytes)
    
    out_path = os.path.join(ENCRYPTED_FOLDER, f"{file.filename}.encrypted")
    with open(out_path, 'w') as f:
        f.write(','.join(map(str, encrypted_data)))
        
    return send_file(out_path, as_attachment=True)

@app.route('/decrypt', methods=['POST'])
def decrypt_file():
    if 'file' not in request.files or 'key' not in request.files:
        return jsonify({'error': 'File and key are required'}), 400
        
    file = request.files['file']
    key_file = request.files['key']
    
    key_content = key_file.read().decode('utf-8')
    try:
        pk = parse_key(key_content, 'private')
    except Exception as e:
        return jsonify({'error': 'Invalid private key format'}), 400
    
    try:
        content = file.read().decode('utf-8')
        
        # Check if content looks like JSON error (from Supabase 404, etc)
        if content.strip().startswith('{') and 'statusCode' in content:
            return jsonify({'error': 'File not found or invalid encrypted content'}), 400
        
        # Try to parse as encrypted data
        encrypted_data = [int(x) for x in content.split(',') if x.strip()]
        
        if not encrypted_data:
            return jsonify({'error': 'No valid encrypted data found'}), 400
            
    except ValueError as e:
        return jsonify({'error': f'Invalid encrypted file format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to read encrypted file: {str(e)}'}), 400
    
    try:
        decrypted_bytes = decrypt(pk, encrypted_data)
    except Exception as e:
        return jsonify({'error': f'Decryption failed: {str(e)}'}), 400
        
    original_filename = file.filename.replace('.encrypted', '')
    if original_filename == file.filename:
        original_filename = 'decrypted_' + file.filename
        
    out_path = os.path.join(DECRYPTED_FOLDER, original_filename)
    with open(out_path, 'wb') as f:
        f.write(decrypted_bytes)
        
    return send_file(out_path, as_attachment=True)

@app.route('/sign', methods=['POST'])
def sign_endpoint():
    if 'file' not in request.files or 'key' not in request.files:
        return jsonify({'error': 'File and key are required'}), 400
        
    file = request.files['file']
    key_file = request.files['key']
    
    key_content = key_file.read().decode('utf-8')
    try:
        pk = parse_key(key_content, 'private')
    except Exception as e:
        return jsonify({'error': 'Invalid private key format'}), 400
        
    file_bytes = file.read()
    signature_data = sign_file(pk, file_bytes)
    
    out_path = os.path.join(SIGNATURES_FOLDER, f"{file.filename}.signature.txt")
    with open(out_path, 'w') as f:
        f.write(','.join(map(str, signature_data)))
        
    return send_file(out_path, as_attachment=True)

@app.route('/verify', methods=['POST'])
def verify_endpoint():
    if 'file' not in request.files or 'key' not in request.files or 'signature' not in request.files:
        return jsonify({'error': 'File, public key, and signature file are required'}), 400
        
    file = request.files['file']
    key_file = request.files['key']
    signature_file = request.files['signature']
    
    key_content = key_file.read().decode('utf-8')
    try:
        pk = parse_key(key_content, 'public')
    except Exception as e:
        return jsonify({'error': 'Invalid public key format'}), 400
        
    file_bytes = file.read()
    
    sig_content = signature_file.read().decode('utf-8')
    signature_data = [int(x) for x in sig_content.split(',') if x]
    
    is_valid = verify_signature(pk, file_bytes, signature_data)
    
    return jsonify({
        'valid': is_valid,
        'message': 'Signature is valid' if is_valid else 'Signature is invalid or file has been modified'
    })

@app.route('/chat/decrypt-text', methods=['POST'])
def decrypt_chat_text():
    """Decrypt text message from chat"""
    try:
        data = request.get_json()
        encrypted_content = data.get('encrypted_content')
        private_key = data.get('private_key')
        
        if not encrypted_content or not private_key:
            return jsonify({'error': 'encrypted_content and private_key are required'}), 400
        
        # Parse private key
        pk = parse_key(private_key, 'private')
        
        # Parse encrypted data
        encrypted_data = [int(x) for x in encrypted_content.split(',') if x]
        
        # Decrypt
        decrypted_bytes = decrypt(pk, encrypted_data)
        decrypted_text = decrypted_bytes.decode('utf-8')
        
        return jsonify({
            'decrypted_text': decrypted_text
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
