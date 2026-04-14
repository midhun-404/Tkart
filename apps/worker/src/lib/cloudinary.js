export async function uploadToCloudinary(file, env) {
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET || 'ml_default'; // Optional if using unsigned, but better to use signed

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary Config");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    // For signed uploads (more secure), we need signature generation.
    // For simplicity in this migration, we'll try unsigned if preset exists, 
    // OR signed using the API Secret.

    // Minimal Signed Upload implementation:
    const timestamp = Math.round((new Date).getTime() / 1000);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);

    // Generate Signature (SHA1 of params + secret)
    // Workers have web crypto
    const msgBuffer = new TextEncoder().encode(`timestamp=${timestamp}${apiSecret}`);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    formData.append('signature', signature);
    // Remove upload_preset for signed upload usually, unless needed.
    formData.delete('upload_preset');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.secure_url;
}
