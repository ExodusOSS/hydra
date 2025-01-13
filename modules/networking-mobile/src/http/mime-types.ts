export function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'jpg':
      return 'image/jpeg'
    case 'jpeg':
    case 'png':
      return `image/${extension}`
    case 'pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}
