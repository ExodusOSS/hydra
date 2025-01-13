export const isValidDomain = (domain) => {
  // eslint-disable-next-line sonarjs/no-empty-after-reluctant
  const domainPattern = /^(?!:\/\/)([\w-]+\.)*[\dA-Za-z][\w-]+\.[A-Za-z]{2,11}?$/
  return domainPattern.test(domain)
}

export const getUrlHostname = (urlOrPath) => {
  if (typeof urlOrPath === 'string') {
    // trim query params because they are not necessary to get the hostname and because URL shim is slow on mobile,
    // remove this when we switch to native or more optimized shim
    const trimmedUrl = urlOrPath.split('?')[0]
    try {
      const { hostname } = new URL(trimmedUrl)
      return hostname
    } catch {
      return null
    }
  }

  // handle URL objects
  if (urlOrPath && typeof urlOrPath === 'object' && typeof urlOrPath.hostname === 'string') {
    return urlOrPath.hostname
  }

  return null
}
