export const omitUndefined = (object: Record<string, any>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined))
