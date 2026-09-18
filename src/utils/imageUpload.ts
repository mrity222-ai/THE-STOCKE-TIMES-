export interface OptimizedImageResult {
  dataUrl: string;
  width?: number;
  height?: number;
  sizeLabel: string;
}

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: 'image/webp' | 'image/jpeg';
  onProgress?: (progress: number) => void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readBlobAsDataUrl = (blob: Blob, onProgress?: (progress: number) => void) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(98, Math.round((event.loaded / event.total) * 100)));
      }
    };
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read selected image.'));
    image.src = url;
  });

export const optimizeImageFile = async (
  file: File,
  {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.78,
    outputType = 'image/webp',
    onProgress
  }: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> => {
  onProgress?.(8);

  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    const dataUrl = await readBlobAsDataUrl(file, (progress) => onProgress?.(Math.max(8, progress)));
    onProgress?.(100);
    return {
      dataUrl,
      sizeLabel: formatBytes(file.size)
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    onProgress?.(35);

    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Image optimizer is not available in this browser.');
    }

    context.drawImage(image, 0, 0, width, height);
    onProgress?.(70);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Image compression failed.'));
        },
        outputType,
        quality
      );
    });

    onProgress?.(88);
    const dataUrl = await readBlobAsDataUrl(blob, (progress) => {
      onProgress?.(88 + Math.round(progress * 0.1));
    });
    onProgress?.(100);

    return {
      dataUrl,
      width,
      height,
      sizeLabel: formatBytes(blob.size)
    };
  } catch (error) {
    console.warn('Falling back to original image upload:', error);
    const dataUrl = await readBlobAsDataUrl(file, (progress) => onProgress?.(Math.max(8, progress)));
    onProgress?.(100);
    return {
      dataUrl,
      sizeLabel: formatBytes(file.size)
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const optimizeImageDataUrl = async (
  dataUrl: string,
  {
    maxWidth = 1100,
    maxHeight = 1100,
    quality = 0.68,
    outputType = 'image/webp',
    onProgress
  }: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> => {
  if (!dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/svg') || dataUrl.startsWith('data:image/gif')) {
    return {
      dataUrl,
      sizeLabel: formatBytes(dataUrl.length)
    };
  }

  try {
    onProgress?.(15);
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image optimizer is not available in this browser.');

    context.drawImage(image, 0, 0, width, height);
    onProgress?.(70);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Image compression failed.'));
        },
        outputType,
        quality
      );
    });

    const optimizedDataUrl = await readBlobAsDataUrl(blob);
    onProgress?.(100);

    return {
      dataUrl: optimizedDataUrl,
      width,
      height,
      sizeLabel: formatBytes(blob.size)
    };
  } catch (error) {
    console.warn('Data URL image optimization failed:', error);
    return {
      dataUrl,
      sizeLabel: formatBytes(dataUrl.length)
    };
  }
};

export const optimizeHtmlImageSources = async (
  html: string,
  options: OptimizeImageOptions = {}
): Promise<string> => {
  if (!html.includes('data:image/')) return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(doc.querySelectorAll('img[src^="data:image/"]'));

  for (const image of images) {
    const source = image.getAttribute('src') || '';
    const optimized = await optimizeImageDataUrl(source, options);
    image.setAttribute('src', optimized.dataUrl);
  }

  return doc.body.innerHTML;
};
