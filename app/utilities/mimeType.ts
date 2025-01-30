const imageSignatures: { [key: string]: string[] } = {
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
  'image/webp': ['52494646'],
};

function getFileSignature(buffer: Buffer): string {
  return buffer.toString('hex', 0, 4);
}

export function getMimeType(buffer: Buffer): string | null {
  const signature = getFileSignature(buffer);
  for (const [mimeType, signatures] of Object.entries(imageSignatures)) {
    if (signatures.includes(signature)) {
      return mimeType;
    }
  }
  return null;
}
