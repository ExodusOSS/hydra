import { createInMemoryAtom } from '@exodus/atoms'

import atomsIdentificationPreprocessor from '../src/preprocessors/atoms-identification.js'

describe('atoms identification preprocessor unit tests', () => {
  it('should add id', () => {
    const testAtomDefinition = {
      id: 'testingAtom',
      type: 'atom',
      factory: () => createInMemoryAtom({ defaultValue: 0 }),
      dependencies: [],
    }
    const { definition } = atomsIdentificationPreprocessor().preprocess({
      definition: testAtomDefinition,
    })
    const instance = definition.factory()
    expect(instance.id).toBe(testAtomDefinition.id)
  })

  it('should override existing id', () => {
    const testAtomDefinition = {
      id: 'testingAtom',
      type: 'atom',
      factory: () => ({ ...createInMemoryAtom({ defaultValue: 0 }), id: 'overrideMe' }),
      dependencies: [],
    }
    const { definition } = atomsIdentificationPreprocessor().preprocess({
      definition: testAtomDefinition,
    })
    const instance = definition.factory()
    expect(instance.id).toBe(testAtomDefinition.id)
  })

  it('should not add id to other node types rather than atoms', () => {
    const testingPluginDefinition = {
      id: 'testingPlugin',
      type: 'plugin',
      factory: () => ({ value: 0 }), //! just for testing purposes
      dependencies: ['abTesting', 'featureFlagAtoms', 'abTestingAtom', 'port'],
    }
    const { definition } = atomsIdentificationPreprocessor().preprocess({
      definition: testingPluginDefinition,
    })
    const originalInstance = testingPluginDefinition.factory()
    const newInstance = definition.factory()
    expect(definition.id).toEqual(testingPluginDefinition.id)
    expect(definition.type).toEqual(testingPluginDefinition.type)
    expect(newInstance.value).toEqual(originalInstance.value)
  })

  it('should not ruin complex factory methods', () => {
    const testAtomDefinition = {
      id: 'testingAtom',
      type: 'atom',
      injectDependenciesAsPositionalArguments: true,
      factory: (a, b, c) => ({ value: a + b + c }),
      dependencies: ['1', '2', '3'],
    }
    const { definition } = atomsIdentificationPreprocessor().preprocess({
      definition: testAtomDefinition,
    })
    const instance = definition.factory(...testAtomDefinition.dependencies)
    expect(instance.id).toBe(testAtomDefinition.id)
    expect(instance.value).toBe('123') // '1' + '2' + '3'
  })

  it('should be able to handle atom-collection nodes', () => {
    const testAtomDefinition = {
      id: 'testingAtom',
      type: 'atom-collection',
      factory: () => ({ 'atom-id-1': { value: 1 } }),
      dependencies: [],
    }
    const { definition } = atomsIdentificationPreprocessor().preprocess({
      definition: testAtomDefinition,
    })

    const instance = definition.factory()
    expect(instance['atom-id-1'].id).toBe('testingAtom.atom-id-1')
  })
})
