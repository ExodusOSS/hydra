import { createInMemoryAtom } from '@exodus/atoms'

import createUiConfigApiDefinition from '../index.js'

const configValues = [
  {
    id: 'acceptedTerms',
    atomId: 'acceptedTermsConfigAtom',
  },
  {
    id: 'exchangeFromAsset',
    atomId: 'exchangeFromAssetConfigAtom',
  },
]

describe('uiConfig api', () => {
  it('should have atoms as dependencies', () => {
    const { definition } = createUiConfigApiDefinition({ configValues })

    expect(definition.dependencies).toEqual([
      'acceptedTermsConfigAtom',
      'exchangeFromAssetConfigAtom',
    ])
  })

  it('should create apis for passed atoms', async () => {
    const { definition } = createUiConfigApiDefinition({ configValues })

    const acceptedTermsConfigAtom = createInMemoryAtom()
    const exchangeFromAssetConfigAtom = createInMemoryAtom()

    const { uiConfig } = definition.factory({
      acceptedTermsConfigAtom,
      exchangeFromAssetConfigAtom,
    })

    await uiConfig.acceptedTerms.set(true)
    await uiConfig.exchangeFromAsset.set('something')

    await expect(uiConfig.acceptedTerms.get()).resolves.toEqual(true)
    await expect(uiConfig.exchangeFromAsset.get()).resolves.toEqual('something')
  })
})
