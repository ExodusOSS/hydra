export const utxosFixture1 = {
  addr1q9dm4luq0vt6gl347dmclx0fpent8mcm882eszxhjfwl2n2mhtlcq7ch53lrtumh37v7jrnxk0h3kww4nqyd0yja74xslddcze:
    {
      address:
        'addr1q9dm4luq0vt6gl347dmclx0fpent8mcm882eszxhjfwl2n2mhtlcq7ch53lrtumh37v7jrnxk0h3kww4nqyd0yja74xslddcze',
      path: 'm/0/0',
      utxos: [
        {
          txId: 'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
          vout: 0,
          value: '7.053562 ADA',
          confirmations: 1,
          tokenBundle: [],
        },
        {
          txId: '7de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
          vout: 0,
          value: '7.276781 ADA',
          confirmations: 1,
          tokenBundle: [],
        },
      ],
    },
}

export const utxosFixture2 = {
  addr1q9dm4luq0vt6gl347dmclx0fpent8mcm882eszxhjfwl2n2mhtlcq7ch53lrtumh37v7jrnxk0h3kww4nqyd0yja74xslddcze:
    {
      address:
        'addr1q9dm4luq0vt6gl347dmclx0fpent8mcm882eszxhjfwl2n2mhtlcq7ch53lrtumh37v7jrnxk0h3kww4nqyd0yja74xslddcze',
      path: 'm/0/0',
      utxos: [
        {
          txId: 'a7fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
          vout: 0,
          value: '18 ADA',
          confirmations: 1,
          tokenBundle: [],
        },
      ],
    },
}

export const utxosFixture3 = {
  anotherAddress: {
    address: 'anotherAddress',
    path: 'm/0/0',
    utxos: [
      {
        txId: '17fb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
        vout: 0,
        value: '1 ADA',
        confirmations: 1,
        tokenBundle: [],
      },
      {
        txId: '2de99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
        vout: 0,
        value: '2 ADA',
        confirmations: 1,
        tokenBundle: [],
      },
    ],
  },
}

export const utxosFixtureBitcoin = {
  solAddress: {
    address: 'btcAdd',
    path: 'm/0/0',
    utxos: [
      {
        txId: 'AAfb7cd7a58d5cf8c76485fc1b4151ae139f33d9d0911a95a0c0be540734de5d',
        vout: 0,
        value: '1 BTC',
        confirmations: 1,
        tokenBundle: [],
      },
      {
        txId: 'BBe99b2367587e121f08e2a95150fbd0939158358181f0a6c3dcd935ac5c0399',
        vout: 0,
        value: '2 BTC',
        confirmations: 1,
        tokenBundle: [],
      },
    ],
  },
}

export const fixture1 = {
  t: 'object',
  v: {
    btt: { t: 'numberunit', v: { u: { BTT: 6, base: 0 }, v: '0 BTT' } },
    cursor: 1,
    trx: { t: 'numberunit', v: { u: { TRX: 6, sun: 0 }, v: '1 TRX' } },
    usdt: { t: 'numberunit', v: { u: { USDTTRX: 6, base: 0 }, v: '0 USDTTRX' } },
    tokenBalances: { t: 'object', v: {} },
    listOfStuff: { t: 'array', v: ['foo', 'bar', 'buzz'] },
    buffer: { t: 'buffer', v: 'AQIDBA==' },
    utxos: {
      t: 'utxocollection',
      v: {
        u: { ADA: 6, lovelaces: 0 },
        v: { ...utxosFixture1 },
      },
    },
    _version: 1,
  },
}

export const legacyFixture1 = {
  btt: '10 BTT',
  cursor: 1,
  trx: '0 TRX',
  usdt: '0 USDTTRX',
  date: '2009-01-03',
  empty: null,
  tokenBalances: { bittorrent: '0 BTT' },
}

export const legacyFixture1Serialized = {
  t: 'object',
  v: {
    btt: { t: 'numberunit', v: { u: { BTT: 6, base: 0 }, v: '10 BTT' } },
    cursor: 1,
    trx: { t: 'numberunit', v: { u: { TRX: 6, sun: 0 }, v: '0 TRX' } },
    usdt: { t: 'numberunit', v: { u: { USDTTRX: 6, base: 0 }, v: '0 USDTTRX' } },
    date: { t: 'date', v: '2009-01-03T00:00:00.000Z' },
    tokenBalances: {
      t: 'object',
      v: { bittorrent: { t: 'numberunit', v: { u: { BTT: 6, base: 0 }, v: '0 BTT' } } },
    },
    empty: null,
    _version: 1,
  },
}
