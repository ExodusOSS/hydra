import { validate } from './validate.mjs'

export function cleanup({ svg, isTrusted }) {
  const clean = svg
    .replace(/<!--[^>]+-->/gu, '')
    .replace(/<title>[^>]+<\/title>/gu, '')
    .replace(/\s+/gu, ' ')
  validate({ svg: clean, isTrusted })
  return clean
}
