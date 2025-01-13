declare module 'format-currency'

declare module '@exodus/fiat-currencies' {
  type Unit = { symbol: string }

  export function hasLeftCurrencySymbol(currency: string): boolean

  export declare const units: {
    USD: Unit
    [currency: string]: Unit
  }
}
