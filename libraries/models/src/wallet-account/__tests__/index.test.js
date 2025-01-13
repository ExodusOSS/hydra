/* eslint-disable no-new */

import test from '../../../_test.js'
import WalletAccount, {
  CUSTODIAL_SOURCES,
  DEFAULT_COLORS,
  DEFAULT_ICONS,
  EXODUS_SRC,
  HARDWARE_SOURCES,
  LABEL_MAX_LENGTH,
  SEED_SRC,
  TREZOR_SRC,
} from '../index.js'

test('walletAccount', () => {
  expect(WalletAccount.DEFAULT_NAME).toEqual('exodus_0')
  expect(String(WalletAccount.DEFAULT)).toEqual('exodus_0')
  expect(String(new WalletAccount({ source: 'exodus', index: 0 }))).toEqual('exodus_0')
  expect(String(new WalletAccount({ source: 'exodus', index: 1 }))).toEqual('exodus_1')
  expect(String(new WalletAccount({ source: 'exodus', index: 1337 }))).toEqual('exodus_1337')
  expect(new WalletAccount({ source: 'exodus', index: 0 })).toEqual({
    index: 0,
    label: 'Exodus',
    lastConnected: undefined,
    model: undefined,
    source: 'exodus',
    color: DEFAULT_COLORS.exodus,
    icon: DEFAULT_ICONS.exodus,
    enabled: true,
    isMultisig: false,
  })

  expect(new WalletAccount({ source: 'exodus', index: 1 })).toEqual({
    index: 1,
    label: '',
    lastConnected: undefined,
    model: undefined,
    source: 'exodus',
    color: DEFAULT_COLORS.exodus,
    icon: DEFAULT_ICONS.exodus,
    enabled: true,
    isMultisig: false,
  })

  expect(
    new WalletAccount({
      source: 'trezor',
      index: 0,
      label: 'MyWallet',
      id: 1,
      model: 'T',
      lastConnected: 1,
    })
  ).toEqual({
    source: 'trezor',
    compatibilityMode: 'trezor',
    index: 0,
    label: 'MyWallet',
    id: 1,
    model: 'T',
    lastConnected: 1,
    icon: DEFAULT_ICONS.trezor,
    color: DEFAULT_COLORS.trezor,
    enabled: true,
    isMultisig: false,
  })

  expect(
    new WalletAccount({
      source: 'exodus',
      index: 0,
      is2FA: true,
      enabled: true,
    })
  ).toEqual({
    source: 'exodus',
    index: 0,
    is2FA: true,
    label: 'Exodus',
    lastConnected: undefined,
    model: undefined,
    color: DEFAULT_COLORS.exodus,
    icon: DEFAULT_ICONS.exodus,
    enabled: true,
    isMultisig: false,
  })

  expect(new WalletAccount({ source: 'exodus', index: 0, isMultisig: true })).toEqual({
    index: 0,
    label: 'Exodus',
    lastConnected: undefined,
    model: undefined,
    source: 'exodus',
    color: DEFAULT_COLORS.exodus,
    icon: DEFAULT_ICONS.exodus,
    enabled: true,
    isMultisig: true,
  })

  expect(new WalletAccount({ source: 'trezor', index: 0, id: 1 }).isHardware).toEqual(true)
  expect(
    new WalletAccount({ source: 'blahblah', index: 0, id: 1, icon: 'something', color: '#ffffff' })
      .isHardware
  ).toEqual(false)
  expect(new WalletAccount({ source: 'exodus', index: 0 }).isHardware).toEqual(false)
  expect(new WalletAccount({ source: 'ftx', id: 1 }).isHardware).toEqual(false)
  expect(new WalletAccount({ source: 'trezor', index: 0, id: 1 }).isCustodial).toEqual(false)
  expect(
    new WalletAccount({ source: 'blahblah', index: 0, id: 1, icon: 'something', color: '#ffffff' })
      .isCustodial
  ).toEqual(false)
  expect(new WalletAccount({ source: 'exodus', index: 0 }).isCustodial).toEqual(false)
  expect(new WalletAccount({ source: 'ftx', id: 1 }).isCustodial).toEqual(true)
  expect(new WalletAccount({ source: 'ftx', id: 1 }).index).toEqual(null)
  expect(String(new WalletAccount({ source: 'ftx', id: 'some_id' }))).toEqual('ftx_some_id')
  expect(() => {
    new WalletAccount({ index: 0 })
  }).toThrow('expected "source" for a wallet account')
  expect(() => {
    new WalletAccount({ source: 'exodus' })
  }).toThrow('expected "index" for a wallet account')
  expect(() => {
    new WalletAccount({ source: 'trezor' })
  }).toThrow('expected "index" for a wallet account')
  expect(() => {
    new WalletAccount({ source: 'exodus', index: 0, id: 'babbys-first-wallet' })
  }).toThrow('unexpected option "id" for a software wallet account')
  expect(() => {
    new WalletAccount({ source: 'blahblah', index: 0 })
  }).toThrow('expected option "id" for a non-software wallet account')
  expect(() => {
    new WalletAccount({ source: 'blahblah', index: 0, id: 0 })
  }).toThrow('expected option "id" for a non-software wallet account')
  expect(() => {
    new WalletAccount({ source: 'exodus', index: 0, lastConnected: Date.now() })
  }).toThrow('unexpected option "lastConnected" for a software wallet account')
  expect(() => {
    new WalletAccount({ source: 'exodus', index: 0, model: 'T' })
  }).toThrow('unexpected option "model" for a software wallet account')

  expect(() => {
    new WalletAccount({ source: 'trezor', id: 'wallet-for-ants', index: 0, is2FA: true })
  }).toThrow('is2FA: true is only valid for an exodus walletAccount')

  expect(() => {
    new WalletAccount({
      source: 'trezor',
      id: 'wallet-for-ants',
      index: 0,
      color: 'white',
    })
  }).toThrow('color')

  expect(
    new WalletAccount({ source: 'exodus', index: 0 }).equals(
      new WalletAccount({ source: 'exodus', index: 0 })
    )
  ).toEqual(true)

  expect(
    new WalletAccount({ source: 'exodus', index: 0 }).equals(
      new WalletAccount({ source: 'exodus', index: 1 })
    )
  ).toEqual(false)

  expect(
    new WalletAccount({ source: 'exodus', index: 0 }).equals(
      new WalletAccount({ source: 'exodus', index: 0, is2FA: true })
    )
  ).toEqual(false)

  expect(
    new WalletAccount({ source: 'exodus', index: 0, color: '#abcdef' }).toJSON().color
  ).toEqual('#abcdef')

  expect(new WalletAccount({ source: 'exodus', index: 0, icon: 'pig' }).toJSON().icon).toEqual(
    'pig'
  )

  expect(new WalletAccount({ source: 'exodus', index: 0, enabled: true }).toJSON().enabled).toEqual(
    true
  )

  expect(
    new WalletAccount({ source: 'exodus', index: 0, enabled: false }).toJSON().enabled
  ).toEqual(false)

  expect(
    new WalletAccount({
      source: 'exodus',
      index: 0,
      label: 'a'.repeat(WalletAccount.LABEL_MAX_LENGTH + 1),
    }).label.length
  ).toEqual(WalletAccount.LABEL_MAX_LENGTH)

  expect(WalletAccount.LABEL_MAX_LENGTH).toEqual(LABEL_MAX_LENGTH)
})

test('update() should update fields of WalletAccount', () => {
  // accept fields object
  expect(
    new WalletAccount({ source: 'exodus', index: 0 }).update({ label: 'Secret Stash' })
  ).toEqual({
    index: 0,
    label: 'Secret Stash',
    lastConnected: undefined,
    model: undefined,
    source: 'exodus',
    color: DEFAULT_COLORS.exodus,
    icon: DEFAULT_ICONS.exodus,
    enabled: true,
    isMultisig: false,
  })

  // accept WalletAccount instance
  expect(
    new WalletAccount({ source: 'exodus', index: 0 }).update(
      new WalletAccount({ source: 'exodus', index: 0, label: 'Secret Stash' })
    )
  ).toEqual({
    index: 0,
    label: 'Secret Stash',
    lastConnected: undefined,
    model: undefined,
    source: 'exodus',
    color: DEFAULT_COLORS.exodus,
    icon: DEFAULT_ICONS.exodus,
    enabled: true,
    isMultisig: false,
  })

  expect(() => new WalletAccount({ source: 'exodus', index: 0 }).update({ index: 1 })).toThrow(
    /immutable/
  )
})

test('toString() returns unique string representation', () => {
  expect(new WalletAccount({ source: EXODUS_SRC, index: 0 }).toString()).toBe('exodus_0')
  expect(new WalletAccount({ source: TREZOR_SRC, id: 42, index: 0 }).toString()).toBe('trezor_0_42')
})

test('toString() for "exodus" account does not include seedId', () => {
  expect(new WalletAccount({ source: EXODUS_SRC, seedId: 'A', index: 0 }).toString()).toBe(
    'exodus_0'
  )
})

test('"seed" source should require "seedId"', () => {
  expect(
    () =>
      new WalletAccount({
        index: 0,
        source: 'seed',
      })
  ).toThrow('expected option "seedId"')
})

test('"seed" source should accept "seedId"', () => {
  expect(
    new WalletAccount({
      index: 0,
      source: 'seed',
      seedId: 'abc',
    }).seedId
  ).toEqual('abc')
})

test('"seed" source should be non-custodial and non-hardware', () => {
  const seedAccount = new WalletAccount({
    index: 0,
    source: 'seed',
    seedId: 'abc',
  })
  expect(seedAccount.isCustodial).toEqual(false)
  expect(seedAccount.isHardware).toEqual(false)
})

test('"seedId" should be part of the toJSON representation', () => {
  expect(
    new WalletAccount({
      index: 0,
      source: 'seed',
      seedId: 'abc',
    }).toJSON().seedId
  ).toEqual('abc')
})

test('isSoftware', () => {
  CUSTODIAL_SOURCES.forEach((source) => {
    expect(new WalletAccount({ source, index: 0, id: '123' }).isSoftware).toEqual(false)
  })
  HARDWARE_SOURCES.forEach((source) => {
    expect(new WalletAccount({ source, index: 0, id: '123' }).isSoftware).toEqual(false)
  })
  expect(new WalletAccount({ source: 'exodus', index: 0 }).isSoftware).toEqual(true)
  expect(new WalletAccount({ source: 'seed', index: 0, seedId: '123' }).isSoftware).toEqual(true)
})

test('defaultWith returns default wallet account with updated field', () => {
  expect(WalletAccount.defaultWith({ seedId: 'A' }).toJSON()).toMatchObject({
    source: WalletAccount.DEFAULT.source,
    index: WalletAccount.DEFAULT.index,
    seedId: 'A',
  })
})

describe('compatibilityMode', () => {
  const walletAccount = new WalletAccount({
    source: SEED_SRC,
    seedId: 'A',
    index: 0,
    compatibilityMode: 'metamask',
  })

  test('cannot be used with custodial sources', () => {
    CUSTODIAL_SOURCES.forEach((source) => {
      expect(
        () => new WalletAccount({ source, index: 0, id: '123', compatibilityMode: 'metamask' })
      ).toThrow('compatibilityMode can not be provided for custodial wallet accounts')
    })
  })

  test('defaults to source for hardware wallet accounts', () => {
    const walletAccount = new WalletAccount({ source: TREZOR_SRC, index: 0, id: '123' })
    expect(walletAccount.compatibilityMode).toBe('trezor')
  })

  test('accepts compatibility mode for hardware wallet accounts', () => {
    const walletAccount = new WalletAccount({
      source: TREZOR_SRC,
      index: 0,
      id: '123',
      compatibilityMode: 'metamask',
    })
    expect(walletAccount.compatibilityMode).toBe('metamask')
  })

  test('toString() ends with compatibilityMode', () => {
    expect(walletAccount.toString()).toBe('seed_0_A_metamask')
  })

  test('toString() does not end with compatibilityMode for exodus accounts', () => {
    expect(
      new WalletAccount({ source: EXODUS_SRC, index: 1, compatibilityMode: 'metamask' }).toString()
    ).toBe('exodus_1')
  })

  test('is part of the toJSON representation', () => {
    expect(walletAccount.toJSON()).toMatchObject({
      compatibilityMode: 'metamask',
    })
  })
})
