import { UnitType } from '@exodus/currency'

const currencies = {
  bitcoin: UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  }),

  bittorrent: UnitType.create({
    base: 0,
    BTT: 6,
  }),

  bat: UnitType.create({
    base: 0,
    BAT: 16,
  }),

  cardano: UnitType.create({
    lovelaces: 0,
    ADA: 6,
  }),

  eosio: UnitType.create({
    larimer: 0,
    EOS: 4,
  }),

  ethereum: UnitType.create({
    wei: 0,
    Kwei: 3,
    Mwei: 6,
    Gwei: 9,
    szabo: 12,
    finney: 15,
    ETH: 18,
  }),

  ethereumclassic: UnitType.create({
    wei: 0,
    Kwei: 3,
    Mwei: 6,
    Gwei: 9,
    szabo: 12,
    finney: 15,
    ETC: 18,
  }),

  monero: UnitType.create({
    atomic: 0,
    XMR: 12,
  }),

  tronmainnet: UnitType.create({
    sun: 0,
    TRX: 6,
  }),

  tetherusdtron: UnitType.create({
    base: 0,
    USDTTRX: 6,
  }),

  nano: UnitType.create({
    raw: 0,
    NANO: 30,
  }),
}

// sintax sugar for test
export const bitcoin = currencies.bitcoin
export const ethereum = currencies.ethereum
export const tronmainnet = currencies.tronmainnet
export const bittorrent = currencies.bittorrent
export const tetherusdtron = currencies.tetherusdtron
export const cardano = currencies.cardano

export default currencies
