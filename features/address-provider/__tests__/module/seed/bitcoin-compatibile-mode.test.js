import KeyIdentifier from '@exodus/key-identifier'
import { Address, WalletAccount } from '@exodus/models'

import { setup, walletAccount as defaultWalletAccount } from '../utils.js'

const suiteGenerator = (compatibilityMode) => {
  const walletAccount = new WalletAccount({ ...defaultWalletAccount, compatibilityMode })
  const { addressProvider } = setup({
    walletAccounts: { [walletAccount]: walletAccount },
  })

  return {
    addressProvider,
    walletAccount,
  }
}

describe('exodus mode', () => {
  const { addressProvider, walletAccount } = suiteGenerator()
  test('getReceiveAddress()', async () => {
    const address = await addressProvider.getReceiveAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('bc1qcgclnu4m5lv5k8eg2hytysvnlkjlhmyuyhtrna', {
        path: 'm/0/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getChangeAddress()', async () => {
    const address = await addressProvider.getChangeAddress({
      walletAccount,
      assetName: 'bitcoin',
    })
    expect(address).toEqual(
      new Address('bc1qjlpydna4su75vmq9hl52hg0n4lnr242dyerll8', {
        path: 'm/1/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 0)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 0,
    })
    expect(address).toEqual(
      new Address('bc1qcgclnu4m5lv5k8eg2hytysvnlkjlhmyuyhtrna', {
        path: 'm/0/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 1)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 1,
    })
    expect(address).toEqual(
      new Address('bc1qjlpydna4su75vmq9hl52hg0n4lnr242dyerll8', {
        path: 'm/1/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })
})

describe('ordinals84 mode', () => {
  const { addressProvider, walletAccount } = suiteGenerator('ordinals84')
  test('getReceiveAddress()', async () => {
    const address = await addressProvider.getReceiveAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('bc1q025ae0e9cl5yc0aw94l8tnvh8tpehr44a4hmtq', {
        path: 'm/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getChangeAddress()', async () => {
    const address = await addressProvider.getChangeAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('bc1qytqtfuqxrr8xk4sle7582q82dec8jkwectr5zm', {
        path: 'm/1',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 0)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 0,
    })
    expect(address).toEqual(
      new Address('bc1qcgclnu4m5lv5k8eg2hytysvnlkjlhmyuyhtrna', {
        path: 'm/0/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 1)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 1,
    })
    expect(address).toEqual(
      new Address('bc1qjlpydna4su75vmq9hl52hg0n4lnr242dyerll8', {
        path: 'm/1/0',
        purpose: 84,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })
})

describe('ordinals86 mode', () => {
  const { addressProvider, walletAccount } = suiteGenerator('ordinals86')
  test('getReceiveAddress()', async () => {
    const address = await addressProvider.getReceiveAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('bc1pcvvjkf4zsdhvj4u0stn4k8qc92qet96wl9awgvya6tc82zajmy0q4rqllg', {
        path: 'm/0',
        purpose: 86,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getChangeAddress()', async () => {
    const address = await addressProvider.getChangeAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('bc1pekhqsuzlrj7vjf5mtzcn7044cu52p2yvsdejlz9n2srq5vng3zcqf5zf6g', {
        path: 'm/1',
        purpose: 86,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 0)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 0,
    })
    expect(address).toEqual(
      new Address('bc1puqwugvnl8rkv7hggvtnl5dzahs3ckuwx2aucmadqes2l2trgam6s7r0ncn', {
        path: 'm/0/0',
        purpose: 86,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 1)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 1,
    })
    expect(address).toEqual(
      new Address('bc1pzu2wrrumz2g4vn06vc3y0a749z4dmk0shegzgpn0ty856d7xxets6ujgch', {
        path: 'm/1/0',
        purpose: 86,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })
})

describe('xverse49 mode', () => {
  const { addressProvider, walletAccount } = suiteGenerator('xverse49')
  test('getReceiveAddress()', async () => {
    const address = await addressProvider.getReceiveAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('3MDqP6oCMoPgYAQ81QLwkks4fxcQRomeZG', {
        path: 'm/0/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress() to return nested segwit', async () => {
    const address = await addressProvider.getChangeAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('3Eo51WAmBWR296SWfubjQyKbhCtSWVGgw4', {
        path: 'm/1/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 0)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 0,
    })
    expect(address).toEqual(
      new Address('3MDqP6oCMoPgYAQ81QLwkks4fxcQRomeZG', {
        path: 'm/0/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 1)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 1,
    })
    expect(address).toEqual(
      new Address('3Eo51WAmBWR296SWfubjQyKbhCtSWVGgw4', {
        path: 'm/1/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })
})

describe('xverse49NotMerged mode', () => {
  const { addressProvider, walletAccount } = suiteGenerator('xverse49NotMerged')
  test('getReceiveAddress()', async () => {
    const address = await addressProvider.getReceiveAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('3MDqP6oCMoPgYAQ81QLwkks4fxcQRomeZG', {
        path: 'm/0/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress() to return nested segwit', async () => {
    const address = await addressProvider.getChangeAddress({
      walletAccount,
      assetName: 'bitcoin',
    })

    expect(address).toEqual(
      new Address('3MDqP6oCMoPgYAQ81QLwkks4fxcQRomeZG', {
        path: 'm/0/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 0)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 0,
    })
    expect(address).toEqual(
      new Address('3MDqP6oCMoPgYAQ81QLwkks4fxcQRomeZG', {
        path: 'm/0/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })

  test('getUnusedAddress(chainIndex: 1)', async () => {
    const address = await addressProvider.getUnusedAddress({
      walletAccount,
      assetName: 'bitcoin',
      chainIndex: 1,
    })
    expect(address).toEqual(
      new Address('3MDqP6oCMoPgYAQ81QLwkks4fxcQRomeZG', {
        path: 'm/0/0',
        purpose: 49,
        walletAccount: walletAccount.toString(),
        keyIdentifier: expect.any(KeyIdentifier),
      })
    )
  })
})
