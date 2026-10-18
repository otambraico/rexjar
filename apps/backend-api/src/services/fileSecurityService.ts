export interface MagicByteValidationResult {
  isValid: boolean;
  detectedMime: string | null;
  error?: string;
}

const MAGIC_NUMBERS = {
  JPEG: [0xFF, 0xD8, 0xFF],
  PNG: [0x89, 0x50, 0x4E, 0x47],
  PDF: [0x25, 0x50, 0x44, 0x46] // %PDF
};

export function validateMagicBytes(buffer: Buffer): MagicByteValidationResult {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, detectedMime: null, error: 'Buffer de archivo inválido o incompleto' };
  }

  // Validación JPEG
  if (buffer[0] === MAGIC_NUMBERS.JPEG[0] && buffer[1] === MAGIC_NUMBERS.JPEG[1] && buffer[2] === MAGIC_NUMBERS.JPEG[2]) {
    return { isValid: true, detectedMime: 'image/jpeg' };
  }

  // Validación PNG
  if (
    buffer[0] === MAGIC_NUMBERS.PNG[0] &&
    buffer[1] === MAGIC_NUMBERS.PNG[1] &&
    buffer[2] === MAGIC_NUMBERS.PNG[2] &&
    buffer[3] === MAGIC_NUMBERS.PNG[3]
  ) {
    return { isValid: true, detectedMime: 'image/png' };
  }

  // Validación PDF
  if (
    buffer[0] === MAGIC_NUMBERS.PDF[0] &&
    buffer[1] === MAGIC_NUMBERS.PDF[1] &&
    buffer[2] === MAGIC_NUMBERS.PDF[2] &&
    buffer[3] === MAGIC_NUMBERS.PDF[3]
  ) {
    return { isValid: true, detectedMime: 'application/pdf' };
  }

  return { isValid: false, detectedMime: null, error: 'Firma binaria (magic bytes) no coincide con formatos permitidos (JPEG, PNG, PDF)' };
}
