export type Asset = any
export type Assets = Record<string, Asset>

export type WithType<O extends object, K extends keyof O, T> = Omit<O, K> & { [key in K]?: T }
