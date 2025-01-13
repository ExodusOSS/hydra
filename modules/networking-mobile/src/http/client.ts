import { Filesystem, Request } from './types'
import { HttpClient as HttpClientSpec } from '@exodus/networking-common/http'
import { File } from '../form'
import NativeFormData from 'react-native/Libraries/Network/FormData'
import { getMimeType } from './mime-types'
import FormData from '../form/form-data'
import { OperatingSystem } from '../shared/types'

type Cleanup = () => Promise<void>

export default class HttpClient implements HttpClientSpec<Request, Response> {
  _fetch: typeof fetch
  constructor(
    private fs: Filesystem,
    private os: OperatingSystem,
    private createUuid: () => string,
    _fetch: typeof fetch = fetch
  ) {
    // to prevent rebinding of fetch's context to HttpClient
    this._fetch = (...args) => _fetch(...args)
  }

  async fetch(url: string, init: Request | undefined): Promise<Response> {
    const { timeoutMs, ...options } = init || {}
    const finalizer: (() => Promise<unknown>)[] = []

    if (options.body instanceof FormData) {
      const { formData, cleanups } = await this.asNativeFormData(options.body)
      options.body = formData
      finalizer.push(() => Promise.all(cleanups.map((cleanup) => cleanup())))
    }

    if (timeoutMs) {
      // TODO: support timeout and signal at the same time
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
      }, timeoutMs)

      options.signal = controller.signal
      finalizer.push(async () => clearTimeout(timeout))
    }

    return this._fetch(url, options).finally(() =>
      Promise.all(finalizer.map((finalize) => finalize()))
    )
  }

  private async asNativeFormData(data: FormData): Promise<{
    formData: NativeFormData
    cleanups: Cleanup[]
  }> {
    const formData = new NativeFormData()
    const cleanups: Cleanup[] = []
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        const uri = this.path(value.name)
        await this.fs.writeFile(uri, value.buffer.toString('base64'), 'base64')
        formData.append(key, {
          name: value.name,
          uri,
          type: getMimeType(value.name),
        })
        cleanups.push(() => this.fs.unlink(uri))
        continue
      }

      formData.append(key, value)
    }
    return { formData, cleanups }
  }

  private path(fileName: string): string {
    const uniqueName = `${this.createUuid()}-${fileName}`
    const path = joinFragments([this.fs.TemporaryDirectoryPath, uniqueName])

    if (this.os === OperatingSystem.Android) {
      return `file://${path}`
    }

    return path
  }
}

function joinFragments(fragments: string[], separator = '/'): string {
  return fragments
    .slice(1)
    .reduce(
      (joined, fragment) =>
        joined.endsWith(separator) ? `${joined}${fragment}` : `${joined}${separator}${fragment}`,
      fragments[0] ?? ''
    )
}
