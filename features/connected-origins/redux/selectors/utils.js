export const parseOrigin = (origin) =>
  origin
    .replace(/((^\w+:|^)\/\/)?(www\.)?/u, '')
    .replace(/\/$/u, '')
    .split('.')
    .slice(-2)
    .join('.')
