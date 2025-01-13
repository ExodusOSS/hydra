export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const dm = 2
  const base = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(base))

  return Number.parseFloat((bytes / Math.pow(base, i)).toFixed(dm)) + ' ' + sizes[i]
}
