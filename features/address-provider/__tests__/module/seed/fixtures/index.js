import { createInMemoryAtom } from '@exodus/atoms'
import { reviver } from 'buffer-json'

import loadFixture from '../load-fixture.cjs'

const _wallets = loadFixture('wallets')

export const wallets = {
  ..._wallets,
  valid: _wallets.valid.map((wallet) => ({
    ...wallet,
    masterSeed: JSON.parse(JSON.stringify(wallet.masterSeed), reviver),
  })),
}

export function createTxLogsAtom(value = {}) {
  return createInMemoryAtom({ defaultValue: { value } })
}
