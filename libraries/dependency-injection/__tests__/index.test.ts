import type { Definition } from '@exodus/dependency-types'
import { createNoopLogger } from '@exodus/logger'
import lodash from 'lodash'

import type { Container } from '../src/container.js'
import createContainer from '../src/container.js'
import {
  AlreadyRegisteredError,
  AlreadyResolvedError,
  DependencyNotFoundError,
  NotResolvedError,
} from '../src/errors.js'

const logger = createNoopLogger()

const modulesById = {
  dinner: {
    id: 'dinner',
    factory: ({ meat, grains, vegetables, dessert }: any) => ({
      id: 'dinner',
      toString: () => [meat, grains, vegetables, dessert].join(', '),
    }),
    dependencies: ['meat', 'grains', 'vegetables', 'dessert'],
  },
  animal: {
    id: 'animal',
    factory: () => ({
      id: 'animal',
      value: 'chicken',
    }),
    dependencies: [],
  },
  meat: {
    id: 'meat',
    type: 'food',
    factory: ({ animal }: any) => ({
      id: 'meat',
      toString: () => animal.value,
    }),
    dependencies: ['animal'],
  },
  grains: {
    id: 'grains',
    type: 'food',
    factory: () => ({
      id: 'grains',
      toString: () => 'rice',
    }),
    dependencies: [],
  },
  vegetables: {
    id: 'vegetables',
    type: 'food',
    factory: () => ({
      id: 'vegetables',
      toString: () => 'potatoes',
    }),
    dependencies: [],
  },
  dessert: {
    id: 'dessert',
    factory: ({ vegetables }: any) => ({
      id: 'dessert',
      toString: () => `more ${vegetables}`,
    }),
    dependencies: ['vegetables'],
  },
} as const satisfies Record<string, Definition>

type Module = (typeof modulesById)[keyof typeof modulesById]

const modules: Module[] = Object.values(modulesById)

const createDefinition = <I extends string, D extends string[]>(id: I, dependencies?: D) =>
  ({
    id,
    factory: () => ({
      id,
    }),
    dependencies,
  }) as const

describe('happy path', () => {
  let container: Container<(typeof modules)[number]>

  beforeEach(() => {
    container = createContainer({ logger }).registerMultiple(modules)
    container.resolve()
  })

  test('register()', () => {
    const container = createContainer({ logger }).register({
      id: 'vegetables',
      type: 'food',
      factory: () => ({
        id: 'vegetables',
        toString: () => 'potatoes',
      }),
    } as const)

    container.resolve()

    expect(container.get('vegetables').id).toEqual('vegetables')

    // @ts-expect-error - TS should complain, we haven't registered this
    const { nonExisting } = container.getAll()
  })

  test('overrides existing dependency when replace set true', () => {
    const potato = { name: 'potato' }
    const sweetPotato = { name: 'not a real potato' }
    const container = createContainer({ logger })
      .register({ id: 'potato', factory: () => potato })
      .register({ id: 'potato', override: true, factory: () => sweetPotato })

    container.resolve()

    expect(container.get('potato')).toEqual(sweetPotato)
  })

  test('resolves dependencies', () => {
    expect(modules.every(({ id }) => container.get(id).id === id)).toBeTruthy()
  })

  test('explicit `id` takes precedence in registerMultiple()', () => {
    const container = createContainer({ logger }).registerMultiple([
      { ...modulesById.vegetables, id: 'vegetablesOverrideId' },
    ] as const)

    container.resolve()

    expect(container.get('vegetablesOverrideId').id).toEqual('vegetables')
  })

  test('leaf has correct dependencies', () => {
    expect(container.get('dinner').toString()).toEqual('chicken, rice, potatoes, more potatoes')
  })

  test('injectDependenciesAsPositionalArguments', () => {
    const container = createContainer({
      logger,
      injectDependenciesAsPositionalArguments: true,
    }).registerMultiple([
      { id: 'a', factory: () => 1 },
      { id: 'b', factory: () => 2 },
      { id: 'c', dependencies: ['a', 'b'], factory: (a, b) => [a, b] },
    ] as const)

    container.resolve()
    expect(container.get('c')).toEqual([1, 2])
  })

  test('injectDependenciesAsPositionalArguments for a specific dependency', () => {
    const container = createContainer({ logger }).registerMultiple([
      { id: 'a', factory: () => 1 },
      { id: 'b', dependencies: ['a'], factory: ({ a }) => a },
      {
        id: 'c',
        dependencies: ['a', 'b'],
        factory: (a, b) => [a, b],
        injectDependenciesAsPositionalArguments: true,
      },
    ] as const)

    container.resolve()
    expect(container.get('b')).toEqual(1)
    expect(container.get('c')).toEqual([1, 1])
  })

  describe('getAll()', () => {
    test('returns all dependencies', () => {
      const instances = container.getAll()

      expect(lodash.size(instances)).toEqual(modules.length)
      modules.forEach(({ id }) => {
        expect(instances[id].id).toEqual(id)
      })
    })

    test('returns dependencies in registration order', () => {
      const container = createContainer({ logger }).registerMultiple([
        { id: 'weasley', factory: () => 'weasley', dependencies: ['potter'] },
        { id: 'potter', factory: () => 'potter' },
      ] as const)

      container.resolve()

      const anotherContainer = createContainer({ logger }).registerMultiple([
        { id: 'potter', factory: () => 'potter' },
        { id: 'weasley', factory: () => 'weasley' },
      ] as const)

      anotherContainer.resolve()

      expect(Object.values(container.getAll())).toEqual(['weasley', 'potter'])
      expect(Object.values(anotherContainer.getAll())).toEqual(['potter', 'weasley'])
    })
  })

  describe('getByType()', () => {
    test('returns dependencies of type', () => {
      expect(lodash.size(container.getByType('food'))).toEqual(3)

      modules.forEach((module) => {
        if (!('type' in module) || module.type !== 'food') return
        const { id } = module

        expect(container.getByType('food')[id].id).toEqual(id)
      })

      expect(lodash.size(container.getByType('other'))).toEqual(0)
    })

    test('returns dependencies in registration order', () => {
      const container = createContainer({ logger }).registerMultiple([
        {
          id: 'weasley',
          type: 'wizard',
          factory: () => 'weasley',
          dependencies: ['potter', 'malfoy'],
        },
        { id: 'malfoy', type: 'joke', factory: () => 'malfoy' },
        { id: 'potter', type: 'wizard', factory: () => 'potter' },
      ] as const)
      container.resolve()

      const anotherContainer = createContainer({ logger }).registerMultiple([
        { id: 'potter', type: 'wizard', factory: () => 'potter' },
        { id: 'malfoy', type: 'joke', factory: () => 'malfoy' },
        { id: 'weasley', type: 'wizard', factory: () => 'weasley' },
      ] as const)
      anotherContainer.resolve()

      expect(Object.values(container.getByType('wizard'))).toEqual(['weasley', 'potter'])
      expect(Object.values(anotherContainer.getByType('wizard'))).toEqual(['potter', 'weasley'])
    })
  })

  test('supports factory.id', () => {
    const modules1 = modules.map(({ id, factory, ...rest }) => {
      const factoryWithId = (...args: [any]) => factory(...args)
      factoryWithId.id = id
      return {
        ...rest,
        factory: factoryWithId,
      }
    })
    const container = createContainer({ logger }).registerMultiple(modules1 as never)

    container.resolve()
    expect((container.get('dinner') as string[]).toString()).toEqual(
      'chicken, rice, potatoes, more potatoes'
    )
  })

  test('supports factory.dependencies', () => {
    const modules1 = modules.map(({ factory, dependencies, ...rest }) => {
      const factoryWithDependencies = (...args: [any]) => factory(...args)
      factoryWithDependencies.dependencies = dependencies
      return {
        ...rest,
        factory: factoryWithDependencies,
      }
    })

    const container = createContainer({ logger }).registerMultiple(modules1 as never)

    container.resolve()
    expect((container.get('dinner') as string[]).toString()).toEqual(
      'chicken, rice, potatoes, more potatoes'
    )
  })

  describe('optional dependencies', () => {
    const potato = { name: 'yummy potato' }
    let container: ReturnType<typeof create>

    const create = () => {
      return createContainer({ logger })
        .register({
          id: 'potato',
          factory: () => potato,
        })
        .register({
          id: 'potatoDish',
          factory: (deps) => deps,
          dependencies: ['potato', 'sweetPotato?'],
        })
    }

    beforeEach(() => {
      container = create()
    })

    test('omits optional dependency not present', () => {
      container.resolve()

      const resolved = container.get('potatoDish')
      expect(resolved).toEqual({
        potato,
      })
    })

    test('includes optional dependency', () => {
      const sweetPotato = { name: 'not a real potato' }

      container.register({
        id: 'sweetPotato',
        factory: () => sweetPotato,
      })

      container.resolve()

      const resolved = container.get('potatoDish')
      expect(resolved).toEqual({
        potato,
        sweetPotato,
      })
    })
  })
})

describe('unhappy sadness', () => {
  test('missing dependencies on resolve()', () => {
    const container = createContainer({ logger }).registerMultiple(
      modules.filter(({ id }) => id !== 'vegetables')
    )

    expect(container.resolve).toThrow(
      'dependency not found: dinner -> vegetables\ndependency not found: dessert -> vegetables'
    )
  })

  test('missing dependencies on resolve() does not lead to cascading circular dependency error', () => {
    const container = createContainer({ logger }).registerMultiple([
      createDefinition('walletAccounts', ['primarySeedIdAtom']),
      createDefinition('keychain'),
      createDefinition('assetsModule'),
      createDefinition('blockchainMetadata', ['walletAccounts']),
      createDefinition('wallet', ['keychain', 'primarySeedIdAtom', 'assetsModule']),
    ])

    expect(container.resolve).not.toThrow('circular dependency')
  })

  test('missing dependencies do not lead to duplicate error messages', () => {
    const container = createContainer({ logger }).registerMultiple([
      createDefinition('walletAccounts', ['primarySeedIdAtom']),
      createDefinition('keychain'),
      createDefinition('assetsModule', ['walletAccounts']),
      createDefinition('blockchainMetadata', ['walletAccounts']),
    ])

    expect(container.resolve).toThrow(/^dependency not found: walletAccounts -> primarySeedIdAtom$/)
  })

  test('unrelated errors on resolve()', () => {
    const container = createContainer({ logger })
      .registerMultiple(modules.filter((m) => m.id !== 'animal'))
      .register({
        id: 'animal',
        factory: () => {
          throw new Error('boo hoo')
        },
      })

    expect(container.resolve).toThrow(new Error('boo hoo'))
  })

  test('no get() before resolve()', () => {
    const container = createContainer({ logger }).registerMultiple(modules)
    expect(() => container.get('dinner')).toThrow(new NotResolvedError())
  })

  test('missing dependencies on get()', () => {
    const container = createContainer({ logger }).registerMultiple(modules)
    container.resolve()

    // @ts-expect-error - TS should complain, we haven't registered this
    expect(() => container.get('missing')).toThrow(new DependencyNotFoundError({ id: 'missing' }))
  })

  test('circular dependencies', () => {
    const circular = [
      ...modules.filter(({ id }) => id !== 'dessert'),
      {
        id: 'dessert',
        factory: () => {},
        dependencies: ['dinner'],
      },
    ]
    const container = createContainer({ logger }).registerMultiple(circular)

    expect(container.resolve).toThrow('dinner -> dessert -> dinner')
  })

  test('resolve locks container', () => {
    const container = createContainer({ logger }).registerMultiple(modules)
    container.resolve()

    expect(() => container.register({ id: 'a', factory: () => ({}) })).toThrow(
      new AlreadyResolvedError()
    )
    expect(container.resolve).toThrow(new AlreadyResolvedError())
  })

  test('resolve container when dependent is defined before dependency', () => {
    const createA = jest.fn(() => 'a')
    const createB = jest.fn(() => 'b')

    const modules = [
      { id: 'a', factory: createA, dependencies: ['b'] },
      { id: 'b', factory: createB, dependencies: [] },
    ] as const

    const container = createContainer({ logger }).registerMultiple(modules as never)
    container.resolve()

    expect(createB.mock.calls.length).toBe(1)
  })

  test('prevent duplicate registrations', () => {
    const container = createContainer({ logger })
    const registerA = () => container.register({ id: 'a', factory: () => ({}) })
    registerA()

    expect(registerA).toThrowError(AlreadyRegisteredError)
  })
})

describe('private dependencies', () => {
  test('injects in same namespace', () => {
    const container = createContainer({ logger }).registerMultiple([
      { namespace: 'hogwarts', id: 'potter', factory: () => ['lumos'] },
      {
        namespace: 'hogwarts',
        id: 'spells',
        dependencies: ['potter'],
        factory: ({ potter }) => ({ potter }),
      },
    ] as const)

    container.resolve()

    expect(container.get('spells').potter).toEqual(['lumos'])
  })

  test('throws when requesting private dependency from other namespace', () => {
    const container = createContainer({ logger }).registerMultiple([
      { namespace: 'assets', id: 'writeableAssetsAtom', factory: () => 1 },
      {
        namespace: 'walletAccounts',
        id: 'walletAccounts',
        dependencies: ['writeableAssetsAtom'],
        factory: () => 2,
      },
    ] as const)

    expect(() => container.resolve()).toThrow(
      'Requested private dependency "writeableAssetsAtom" in namespace "assets" from "walletAccounts" in namespace "walletAccounts"'
    )
  })

  test('allows requesting public dependency from other namespace', () => {
    const container = createContainer({ logger }).registerMultiple([
      { namespace: 'assets', id: 'writeableAssetsAtom', public: true, factory: () => 1 },
      {
        namespace: 'walletAccounts',
        id: 'walletAccounts',
        dependencies: ['writeableAssetsAtom'],
        factory: () => 2,
      },
    ])

    expect(() => container.resolve()).not.toThrow()
  })

  test('getByType includes private deps', () => {
    const container = createContainer({ logger }).registerMultiple([
      {
        id: 'potterAtom',
        namespace: 'hogwarts',
        type: 'atom',
        factory: () => 'potter',
      },
      {
        id: 'weasleyAtom',
        type: 'atom',
        dependencies: [],
        factory: () => 'weasley',
      },
    ])

    container.resolve()
    expect(Object.values(container.getByType('atom'))).toEqual(['potter', 'weasley'])
  })

  test('get can access private dep', () => {
    const container = createContainer({ logger }).registerMultiple([
      {
        id: 'potterAtom',
        namespace: 'hogwarts',
        factory: () => 'potter',
      },
    ])

    container.resolve()
    expect(container.get('potterAtom')).toEqual('potter')
  })

  test('does not validate privacy of node without namespace', () => {
    const container = createContainer({ logger }).registerMultiple([
      { id: 'writeableAssetsAtom', private: true, factory: () => 1 },
      {
        namespace: 'walletAccounts',
        id: 'walletAccounts',
        dependencies: ['writeableAssetsAtom'],
        factory: () => 2,
      },
    ])

    expect(() => container.resolve()).not.toThrow()
  })
})
