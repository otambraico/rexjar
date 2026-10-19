// Web Worker para compresión y optimización de comprobantes en cliente
// Aplica Degradación Elegante Basada en Capacidades (RAM < 2GB) para evitar OOM Killer

self.onmessage = async (e: MessageEvent<{ file: File; maxDim?: number; quality?: number }>) => {
  const { file, maxDim = 1920, quality = 0.82 } = e.data;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    // Redimensionar manteniendo relación de aspecto
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    // Dibujar en OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo inicializar OffscreenCanvas 2D');

    ctx.drawImage(bitmap, 0, 0, width, height);

    // Exportar como Blob WebP/JPEG optimizado
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality
    });

    self.postMessage({
      success: true,
      blob,
      originalSize: file.size,
      compressedSize: blob.size,
      width,
      height
    });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
