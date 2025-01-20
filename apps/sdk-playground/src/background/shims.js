import buildMetadata from '../build-metadata'

const DEFAULT_HEADERS_URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)*exodus\.io/u

const originalFetch = window.fetch

const DEFAULT_FETCH_HEADERS = {
  'x-exodus-app-id': buildMetadata.name,
  'x-exodus-version': buildMetadata.version,
  'x-requested-with': `${buildMetadata.name} ${buildMetadata.version}`,
}

const customFetch = (url, opts = {}) => {
  const headers = DEFAULT_HEADERS_URL_PATTERN.test(url)
    ? { ...DEFAULT_FETCH_HEADERS, ...opts.headers }
    : { ...opts.headers }

  const newOptions = { ...opts, headers }

  return originalFetch(url, newOptions)
}

const setDefaultHeader = (key, value) => (DEFAULT_FETCH_HEADERS[key] = value)

Object.defineProperty(customFetch, 'setDefaultHeader', { value: setDefaultHeader, writable: false })

window.fetch = customFetch
