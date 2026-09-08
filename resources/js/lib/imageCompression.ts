/**
 * Utility for compressing and resizing images client-side before upload.
 * Reduces raw 5MB-10MB mobile/camera photos down to ~100KB-200KB WebP/JPEG strings.
 * This prevents HTTP 413 (Payload Too Large), PHP post_max_size truncation,
 * PHP memory_limit exhaustion, and upload timeouts on live hosting environments.
 */
export async function compressImageFile(
    file: File,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82
): Promise<string> {
    // Keep SVGs and ICOs untouched
    if (file.type.includes('svg') || file.type.includes('icon')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                // Scale down while preserving aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.max(1, Math.round(width * ratio));
                    height = Math.max(1, Math.round(height * ratio));
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(e.target?.result as string);
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Try exporting as WebP first for optimal compression
                try {
                    const webpData = canvas.toDataURL('image/webp', quality);
                    if (webpData.startsWith('data:image/webp')) {
                        resolve(webpData);
                        return;
                    }
                } catch {
                    // Fall back to JPEG if WebP export is not supported by browser
                }

                try {
                    const jpegData = canvas.toDataURL('image/jpeg', quality);
                    resolve(jpegData);
                } catch {
                    resolve(e.target?.result as string);
                }
            };

            img.onerror = () => {
                // If rendering image to Image element fails, fallback to raw base64
                resolve(e.target?.result as string);
            };

            img.src = e.target?.result as string;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
