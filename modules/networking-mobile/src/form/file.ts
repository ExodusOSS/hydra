import { Buffer } from 'buffer'

export class File extends Blob {
  /**
   * Constructs a File from the given buffer
   *
   * @param buffer The buffer
   * @param name The file name
   * @param options Provide `options.type` to set the mime type of the file's
   * content (such as image/jpeg) and `options.lastModified` to set the last modified date
   * (defaults to the current date)
   */

  constructor(
    public buffer: Buffer,
    public name: string,
    {
      type = 'application/octet-stream',
      lastModified = new Date(),
    }: { lastModified?: number | Date; type?: string } = {}
  ) {
    // the typing is a little off here, Blob can actually be constructed from a Buffer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super([buffer], {
      type,
      lastModified: Number(lastModified),
    })
  }

  get [Symbol.toStringTag]() {
    return 'File'
  }

  toString() {
    return '[object File]'
  }
}
