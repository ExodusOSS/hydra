import { validate } from './validate.mjs'

export function cleanup(svg) {
  const clean = svg
    .replace(/<!--[^>]+-->/gu, '')
    .replace(/<title>[^>]+<\/title>/gu, '')
    .replace(/\s+/gu, ' ')
  validate(clean)
  return clean
}
