import createUiConfigAtomDefinitions from '../index.js'

const localConfigValues = [
  {
    id: 'acceptedTerms',
    atomId: 'acceptedTermsConfigAtom',
  },
  {
    id: 'exchangeFromAsset',
    atomId: 'exchangeFromAssetConfigAtom',
    encrypted: true,
  },
]

const syncableConfigValues = [
  {
    id: 'enableSounds',
    atomId: 'enableSoundsConfigAtom',
    encrypted: true,
    syncable: true,
  },
  {
    id: 'shareActivity',
    atomId: 'shareActivityConfigAtom',
    syncable: true,
  },
]

describe('uiConfig atoms', () => {
  it('should create atom definitions', () => {
    const definitions = createUiConfigAtomDefinitions({ configValues: localConfigValues })

    expect(definitions.length).toBe(2)

    // test ids
    expect(definitions[0].definition.id).toBe('acceptedTermsConfigAtom')
    expect(definitions[1].definition.id).toBe('exchangeFromAssetConfigAtom')

    // test storage aliases
    expect(definitions[0].aliases[0].implementationId).toBe('unsafeStorage')
    expect(definitions[1].aliases[0].implementationId).toBe('storage')
  })

  it('should create syncable atom definitions', () => {
    const definitions = createUiConfigAtomDefinitions({ configValues: syncableConfigValues })

    expect(definitions.length).toBe(4)

    const localDefinitions = definitions.filter((d) => !d.definition.id.startsWith('syncable'))
    const syncableDefinitions = definitions.filter((d) => d.definition.id.startsWith('syncable'))

    expect(localDefinitions.length).toBe(2)
    expect(syncableDefinitions.length).toBe(2)

    expect(localDefinitions[0].definition.id).toBe('enableSoundsConfigAtom')
    expect(localDefinitions[1].definition.id).toBe('shareActivityConfigAtom')

    expect(syncableDefinitions[0].definition.id).toBe('syncableenableSoundsConfigAtom')
    expect(syncableDefinitions[1].definition.id).toBe('syncableshareActivityConfigAtom')

    expect(syncableDefinitions[0].definition.dependencies).toContain('fusion')
    expect(syncableDefinitions[1].definition.dependencies).toContain('fusion')
  })
})
