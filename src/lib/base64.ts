/**
 * Safe base64 encoding for ArrayBuffers of any size.
 *
 * The naive `btoa(String.fromCharCode(...new Uint8Array(buffer)))` pattern
 * spreads every byte as a separate function argument, which causes a
 * "Maximum call stack size exceeded" error for images larger than ~100 KB.
 *
 * This function processes the buffer in fixed-size chunks to avoid the limit.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
