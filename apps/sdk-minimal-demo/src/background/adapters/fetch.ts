import buildMetadata from '../../constants/build-metadata.js'

const DEFAULT_HEADERS_URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)*exodus\.io/u

const DEFAULT_FETCH_HEADERS: Record<string, string> = {
  'x-exodus-app-id': buildMetadata.appId,
  'x-exodus-version': buildMetadata.version,
  'x-requested-with': `${buildMetadata.appId} ${buildMetadata.version}`,
}

const customFetch = (url: string, opts: any = {}) => {
  const headers = DEFAULT_HEADERS_URL_PATTERN.test(url)
    ? { ...DEFAULT_FETCH_HEADERS, ...opts.headers }
    : { ...opts.headers }

  const newOptions = { ...opts, headers }

  return fetch(url, newOptions)
}

const setDefaultHeader = (key: string, value: string) => {
  DEFAULT_FETCH_HEADERS[key] = value
}

Object.defineProperty(customFetch, 'setDefaultHeader', { value: setDefaultHeader, writable: false })

export default customFetch
