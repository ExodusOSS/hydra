import { UnitType } from '@exodus/currency'

import type { TxProps } from '../../index.js'

const mytokenUnits = { fernies: 0, MYTOKEN: 8 }
const myfeetokenUnits = { feeies: 0, MYFEETOKEN: 6 }

export const customAssets = {
  mytoken: {
    name: 'mytoken',
    units: mytokenUnits,
    currency: UnitType.create(mytokenUnits),
    feeAssetName: 'myfeetoken',
  },

  myfeetoken: {
    name: 'myfeetoken',
    units: myfeetokenUnits,
    currency: UnitType.create(myfeetokenUnits),
    feeAssetName: 'myfeetoken',
  },
}
export const customAssetTxJson1 = {
  txId: '90666373b49cb838b336b9c25e3d0e0c7b8fff1bcabcd173b3115bd0b24de247',
  coinAmount: '0.001 MYTOKEN',
  feeAmount: '0.003 MYFEETOKEN',
  date: '2016-11-29T05:13:59.697Z',
  coinName: 'mytoken',
  feeCoinName: 'myfeetoken',
  confirmations: 2,
  addresses: [
    {
      address: '1GtP6HLL9oKPwpH3acy44YCTovzLb56x6L',
      meta: {},
    },
    {
      address: '1AnzK5NiQ5bZsvBzRNXHgbMSEUvQhtuMCQ',
      meta: {},
    },
  ],
  data: {
    x: 10,
  },
  currencies: {
    mytoken: { fernies: 0, MYTOKEN: 8 },
    myfeetoken: { feeies: 0, MYFEETOKEN: 6 },
  },
  version: 1,
} as unknown as TxProps
