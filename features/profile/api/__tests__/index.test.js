import { createInMemoryAtom } from '@exodus/atoms'

import profileApiDefinition from '../index'

describe('profile api', () => {
  let api
  let fusionProfileAtom

  beforeEach(() => {
    fusionProfileAtom = createInMemoryAtom({ defaultValue: { name: 'Exodus', nft: null } })
    api = profileApiDefinition.factory({ fusionProfileAtom })
  })

  it('should get profile value', async () => {
    await expect(api.profile.get()).resolves.toEqual({ name: 'Exodus', nft: null })
  })

  it('should set profile value', async () => {
    await api.profile.set({ name: 'Satoshi', nft: null })

    await expect(api.profile.get()).resolves.toEqual({ name: 'Satoshi', nft: null })
  })
})
