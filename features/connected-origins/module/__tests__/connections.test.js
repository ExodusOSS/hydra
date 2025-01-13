import { createInMemoryAtom } from '@exodus/atoms'

import createConnectedOriginsDefinition from '../index.js'

describe('connected origins module', () => {
  let connectedOriginsAtom
  let connectedOrigins

  beforeEach(async () => {
    connectedOriginsAtom = createInMemoryAtom({ defaultValue: [] })
    connectedOrigins = createConnectedOriginsDefinition.factory({ connectedOriginsAtom })
  })

  test('trust new origin', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      trusted: true,
    })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins[0]).toMatchObject({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      favorite: false,
      autoApprove: false,
      connectedAssetName: 'solana',
      activeConnections: [],
    })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toHaveLength(1)
  })

  test('trust new origin for different asset', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'ethereum',
      trusted: true,
    })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins[0]).toMatchObject({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      favorite: false,
      autoApprove: false,
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum'],
      activeConnections: [],
    })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toHaveLength(1)
  })

  test('add new origin with additional assetNames', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum', 'solana', 'optimism'],
    })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins[0]).toMatchObject({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      favorite: false,
      autoApprove: false,
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum', 'solana', 'optimism'],
      activeConnections: [],
    })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toHaveLength(1)
  })

  test('not trust again trusted origin', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      trusted: true,
    })
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      trusted: true,
    })

    const origins = await connectedOriginsAtom.get()
    expect(origins).toHaveLength(1)
  })

  test('untrust existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.untrust({ origin: 'exodus.com' })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(newOrigins).toHaveLength(0)
  })

  test('not untrust missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.untrust({ origin: 'exodude.com' })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toEqual(newOrigins)
  })

  test('isTrusted return true for trusted origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const result = await connectedOrigins.isTrusted({ origin: 'exodus.com' })

    expect(result).toBe(true)
  })

  test('isTrusted return false for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const result = await connectedOrigins.isTrusted({ origin: 'exodude.com' })

    expect(result).toBe(false)
  })

  test('isAutoApprove return true for trusted origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: true }])
    const result = await connectedOrigins.isAutoApprove({ origin: 'exodus.com' })

    expect(result).toBe(true)
  })

  test('isAutoApprove return false for no non auto approve origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: false }])
    const result = await connectedOrigins.isAutoApprove({ origin: 'exodus.com' })

    expect(result).toBe(false)
  })

  test('isAutoApprove return false for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const result = await connectedOrigins.isAutoApprove({ origin: 'exodude.com' })

    expect(result).toBe(false)
  })

  test('setAutoApprove to true for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: false }])
    await connectedOrigins.setAutoApprove({ origin: 'exodus.com', value: true })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', autoApprove: true }])
  })

  test('setAutoApprove to false for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: true }])
    await connectedOrigins.setAutoApprove({ origin: 'exodus.com', value: false })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', autoApprove: false }])
  })

  test('setAutoApprove skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.setAutoApprove({ origin: 'exodude.com', value: false })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toEqual(newOrigins)
  })

  test('setFavorite to true for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', favorite: false }])
    await connectedOrigins.setFavorite({ origin: 'exodus.com', value: true })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', favorite: true }])
  })

  test('setFavorite to false for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', favorite: true }])
    await connectedOrigins.setFavorite({ origin: 'exodus.com', value: false })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', favorite: false }])
  })

  test('setFavorite skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.setFavorite({ origin: 'exodude.com', value: false })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toEqual(newOrigins)
  })

  test('connect should add connection to existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    await connectedOrigins.connect({ id: 'connection-id', origin: 'exodus.com' })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([
      { origin: 'exodus.com', activeConnections: [{ id: 'connection-id' }] },
    ])
  })

  test('connect should skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])

    await expect(
      connectedOrigins.connect({ id: 'connection-id', origin: 'exodude.com' })
    ).resolves.not.toThrow()
  })

  test('disconnect should add connection to existing origin', async () => {
    await connectedOriginsAtom.set([
      { origin: 'exodus.com', connectedOrigins: [{ id: 'connection-id' }] },
    ])
    await connectedOrigins.disconnect({ id: 'connection-id', origin: 'exodus.com' })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', activeConnections: [] }])
  })

  test('disconnect should skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])

    await expect(
      connectedOrigins.disconnect({ id: 'connection-id', origin: 'exodude.com' })
    ).resolves.not.toThrow()
  })

  test('updateConnections should update icon', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', icon: 'a' }])
    await connectedOrigins.updateConnection({ origin: 'exodus.com', icon: 'b' })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toMatchObject([{ origin: 'exodus.com', icon: 'b' }])
  })

  test('clearConnections should clear all existing origins', async () => {
    await connectedOriginsAtom.set([
      { origin: 'exodus.com', connectedOrigins: [{ id: '1' }] },
      { origin: 'exodude.com', connectedOrigins: [{ id: '2' }] },
    ])
    await connectedOrigins.clearConnections()

    const stored = await connectedOriginsAtom.get()

    expect(stored).toMatchObject([
      { origin: 'exodus.com', activeConnections: [] },
      { origin: 'exodude.com', activeConnections: [] },
    ])
  })
})
