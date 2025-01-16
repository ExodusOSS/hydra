const ICON_MAX_SIZE = 120

const base64 = (buf) => btoa([...buf].map((byte) => String.fromCharCode(byte)).join('')) // eslint-disable-line unicorn/prefer-code-point

export const getTitle = () => {
  const siteName = document.querySelector('head > meta[property="og:site_name"]')

  if (siteName) return siteName.content

  const metaTitle = document.querySelector('head > meta[name="title"]')

  if (metaTitle) return metaTitle.content

  return document.title
}

const getIconSize = (icon) => {
  try {
    const matches = icon.sizes.value.match(/\d+/gmu)
    return parseInt(matches[0], 10)
  } catch {
    return 0
  }
}

const getIconDimensions = (image, size) => {
  const ratio = image.width / image.height

  let width, height, dWidth, dHeight, dx, dy

  if (ratio > 1) {
    width = Math.min(image.width, size)
    dWidth = width
    height = width
    dHeight = Math.round(width / ratio)
    dx = 0
    dy = Math.floor((dWidth - dHeight) / 2)
  } else {
    height = Math.min(image.height, size)
    dHeight = height
    width = height
    dWidth = Math.round(height * ratio)
    dy = 0
    dx = Math.floor((dHeight - dWidth) / 2)
  }

  return { width, height, dWidth, dHeight, dx, dy }
}

const getIconData = (href) => {
  const img = new Image()

  img.crossOrigin = 'anonymous'
  img.src = href

  return new Promise((resolve) => {
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const dimensions = getIconDimensions(img, ICON_MAX_SIZE)

      const width = dimensions.width
      const height = dimensions.height

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, dimensions.dx, dimensions.dy, dimensions.dWidth, dimensions.dHeight)

      const { data } = ctx.getImageData(0, 0, width, height)

      resolve({ width, height, data: base64(data) })
    })

    // If can't compute, enable connecting dapp without icon. UI will render empty state
    img.onerror = () => resolve(null) // eslint-disable-line unicorn/prefer-add-event-listener
  })
}

export const getIcon = async () => {
  const icons = document.querySelectorAll('head > link[rel~="icon"]')
  const sortedIcons = [...icons].sort((a, b) => getIconSize(b) - getIconSize(a))
  const href = sortedIcons[0]?.href || `${document.location.origin}/favicon.ico`

  return getIconData(href)
}
