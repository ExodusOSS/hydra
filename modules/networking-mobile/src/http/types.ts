import { CommonRequestInit } from '@exodus/networking-common/http'
import { FormData } from '../form'

export type Filesystem = {
  TemporaryDirectoryPath: string
  writeFile(filepath: string, contents: string, encodingOrOptions?: string): Promise<void>
  unlink(filepath: string): Promise<void>
}

export type Request = RequestInit & CommonRequestInit & { body?: RequestInit['body'] | FormData }
