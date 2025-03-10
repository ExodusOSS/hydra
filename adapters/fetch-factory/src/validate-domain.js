// eslint-disable-next-line sonarjs/no-empty-after-reluctant
const domainPattern = /^(?!:\/\/)([\w-]+\.)*[\dA-Za-z][\w-]+\.[A-Za-z]{2,11}?$/u

export const isValidDomain = (domain) => {
  return domainPattern.test(domain)
}

const PROTOCOL_SEPARATOR = '://'

function hostnameFromString(url) {
  const protocolSeparatorStart = url.indexOf(PROTOCOL_SEPARATOR)
  if (protocolSeparatorStart === -1) {
    return null
  }

  let hostname = url.slice(protocolSeparatorStart + PROTOCOL_SEPARATOR.length)

  const portIndex = hostname.indexOf(':')
  if (portIndex !== -1) {
    hostname = hostname.slice(0, portIndex)
    return isValidDomain(hostname) ? hostname : null
  }

  const rootIndicatorIndex = hostname.indexOf('/')
  if (rootIndicatorIndex !== -1) {
    hostname = hostname.slice(0, rootIndicatorIndex)
    return isValidDomain(hostname) ? hostname : null
  }

  const querySeparatorIndex = hostname.indexOf('?')
  if (querySeparatorIndex !== -1) {
    hostname = hostname.slice(0, querySeparatorIndex)
  }

  return isValidDomain(hostname) ? hostname : null
}

export const getUrlHostname = (urlOrPath) => {
  if (typeof urlOrPath === 'string') {
    return hostnameFromString(urlOrPath)
  }

  // handle URL objects
  if (urlOrPath && typeof urlOrPath === 'object' && typeof urlOrPath.hostname === 'string') {
    return urlOrPath.hostname
  }

  return null
}
