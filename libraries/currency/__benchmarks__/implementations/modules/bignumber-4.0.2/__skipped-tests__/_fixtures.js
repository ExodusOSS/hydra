import UnitType from '../unit-type'

export const bitcoin = UnitType.create({
  satoshis: 0,
  bits: 2,
  BTC: 8,
})

export const ethereum = UnitType.create({
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  ETH: 18,
})

export const dollar = UnitType.create({
  cents: 0,
  USD: 2,
})

// extra assets used for the rate conversion tests - chosen to have as many unique unit powers as possible
export const neo = UnitType.create({
  NEO: 0,
})

export const matchpool = UnitType.create({
  base: 0,
  GUP: 3,
})

export const eosio = UnitType.create({
  larimer: 0,
  EOS: 4,
})

export const ripple = UnitType.create({
  drop: 0,
  XRP: 6,
})

export const stellar = UnitType.create({
  stroops: 0,
  XLM: 7,
})

export const digix = UnitType.create({
  base: 0,
  DGD: 9,
})

export const monero = UnitType.create({
  atomic: 0,
  XMR: 12,
})
