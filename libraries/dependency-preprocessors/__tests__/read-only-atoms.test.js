import { createInMemoryAtom } from '@exodus/atoms'

import preprocess from '../src/index.js'
import readOnlyAtoms from '../src/preprocessors/read-only-atoms.js'

describe('readonlyAtoms', () => {
  const createAtomDefinition = (id, { writeableOutsideNamespace, namespace = 'other' } = {}) => {
    return {
      definition: {
        id,
        namespace,
        factory: jest.fn(),
        dependencies: [],
      },
      writeableOutsideNamespace,
    }
  }

  it('should return node as is if no atoms in deps', () => {
    const node = {
      definition: {
        id: 'hogwarts',
        factory: jest.fn(),
        dependencies: ['forbiddenForrest'],
      },
    }

    const processed = preprocess({
      dependencies: [node],
      preprocessors: [readOnlyAtoms()],
    })

    expect(processed).toEqual([node.definition])
  })

  it('should return node as is if all atoms in same namespace', () => {
    const node = {
      definition: {
        id: 'wayneManor',
        namespace: 'gotham',
        factory: jest.fn(),
        dependencies: ['batmobileAtom'],
      },
    }

    const batmobileAtom = createAtomDefinition('batmobileAtom', { namespace: 'gotham' })

    const processed = preprocess({
      dependencies: [node, batmobileAtom],
      preprocessors: [readOnlyAtoms()],
    })

    expect(processed).toEqual([node.definition, batmobileAtom.definition])
  })

  it('should wrap atoms with readonly enhancer', async () => {
    const node = {
      definition: {
        id: 'wayneAccounting',
        factory: (deps) => deps,
        dependencies: ['revenueAtom', 'budgetAtom', 'secretWeaponAtoms'],
      },
    }

    const revenueAtomDefinition = createAtomDefinition('revenueAtom', { namespace: 'other' })
    const secretWeaponAtomsDefinition = createAtomDefinition('secretWeaponAtoms', {
      namespace: 'other',
    })

    const [{ factory: createWayneAccounting }] = preprocess({
      dependencies: [node, revenueAtomDefinition, secretWeaponAtomsDefinition],
      preprocessors: [readOnlyAtoms()],
    })

    const { revenueAtom, secretWeaponAtoms } = createWayneAccounting({
      revenueAtom: createInMemoryAtom({ defaultValue: 0 }),
      secretWeaponAtoms: {
        suit: createInMemoryAtom({ defaultValue: 0 }),
        car: createInMemoryAtom({ defaultValue: 0 }),
      },
    })

    await expect(revenueAtom.set(100)).rejects.toThrow()
    await expect(revenueAtom.get()).resolves.toBe(0)

    await expect(secretWeaponAtoms.suit.set(100)).rejects.toThrow()
    await expect(secretWeaponAtoms.suit.get()).resolves.toBe(0)

    await expect(secretWeaponAtoms.car.set(100)).rejects.toThrow()
    await expect(secretWeaponAtoms.car.get()).resolves.toBe(0)
  })

  it('should not wrap optional atoms with readonly enhancer when missing', async () => {
    const node = {
      definition: {
        id: 'wayneAccounting',
        namespace: 'wayne-enterprises',
        factory: (deps) => deps,
        dependencies: ['budgetAtom?', 'secretBudgetAtom?'],
      },
    }

    const [{ factory: createWayneAccounting }] = preprocess({
      dependencies: [node, createAtomDefinition('budgetAtom', { namespace: 'wayne-enterprises' })],
      preprocessors: [readOnlyAtoms()],
    })

    const { budgetAtom, secretBudgetAtom } = createWayneAccounting({
      budgetAtom: createInMemoryAtom({ defaultValue: 0 }),
    })

    await budgetAtom.set(100)

    expect(secretBudgetAtom).toBe(undefined)
  })

  it('should wrap atom collection with readonly enhancer', async () => {
    const node = {
      definition: {
        id: 'wayneAccounting',
        factory: (deps) => deps,
        dependencies: ['secretWeaponAtoms', 'budgetAtom'],
      },
    }

    const secretWeaponAtomsDefinition = {
      definition: {
        id: 'secretWeaponAtoms',
        namespace: 'secret',
        factory: (deps) => deps,
        dependencies: ['secretWeaponAtoms', 'budgetAtom'],
      },
    }

    const [{ factory: createWayneAccounting }] = preprocess({
      dependencies: [node, secretWeaponAtomsDefinition],
      preprocessors: [readOnlyAtoms()],
    })

    const { secretWeaponAtoms } = createWayneAccounting({
      budgetAtom: createInMemoryAtom({ defaultValue: 0 }),
      secretWeaponAtoms: {
        suit: createInMemoryAtom({ defaultValue: 0 }),
        car: createInMemoryAtom({ defaultValue: 0 }),
      },
    })

    await expect(secretWeaponAtoms.suit.set(42)).rejects.toThrow()
    await expect(secretWeaponAtoms.car.set(100)).rejects.toThrow()
  })

  const createFakeAtom = () => ({
    set: async () => {},
  })

  it('should not try to wrap atomish sounding deps', async () => {
    const node = {
      definition: {
        id: 'fallout',
        factory: (deps) => deps,
        dependencies: ['atomicBonds', 'childrenOfAtomChurch'],
      },
    }

    const [{ factory: createFallout }] = preprocess({
      dependencies: [node],
      preprocessors: [readOnlyAtoms()],
    })

    const { atomicBonds, childrenOfAtomChurch, allTheAtoms } = createFallout({
      atomicBonds: createFakeAtom(),
      childrenOfAtomChurch: createFakeAtom(),
      allTheAtoms: createFakeAtom(),
    })

    await expect(atomicBonds.set('abc')).resolves.not.toThrow()
    await expect(childrenOfAtomChurch.set('abc')).resolves.not.toThrow()
    await expect(allTheAtoms.set('abc')).resolves.not.toThrow()
  })

  describe('optional atoms', () => {
    it('should wrap with readonly enhancer', async () => {
      const node = {
        definition: {
          id: 'wayneAccounting',
          factory: (deps) => deps,
          dependencies: ['budgetAtom?'],
        },
      }

      const budgetAtomDefinition = {
        definition: {
          id: 'batmobileAtom',
          factory: jest.fn(),
          dependencies: [],
        },
      }

      const [{ factory: createWayneAccounting }] = preprocess({
        dependencies: [node, budgetAtomDefinition],
        preprocessors: [readOnlyAtoms()],
      })

      const { budgetAtom } = createWayneAccounting({
        budgetAtom: createInMemoryAtom({ defaultValue: 0 }),
      })

      await expect(budgetAtom.set(100)).rejects.toThrow()
    })

    it('should allow writing to an optional atom', async () => {
      const node = {
        definition: {
          id: 'wayneAccounting',
          namespace: 'gotham',
          factory: (deps) => deps,
          dependencies: ['budgetAtom?'],
        },
      }

      const budgetAtomDefinition = createAtomDefinition('budgetAtom', { namespace: 'gotham' })

      const [{ factory: createWayneAccounting }] = preprocess({
        dependencies: [node, budgetAtomDefinition],
        preprocessors: [readOnlyAtoms()],
      })

      const { budgetAtom } = createWayneAccounting({
        budgetAtom: createInMemoryAtom({ defaultValue: 0 }),
      })

      await budgetAtom.set(100)
      await expect(budgetAtom.get()).resolves.toBe(100)
    })
  })

  describe('warn mode', () => {
    it('should throw when no logger supplied', () => {
      expect(() => readOnlyAtoms({ warn: true })).toThrow(/logger has to be provided in warn mode/i)
    })

    it('should warn if atom written to but not whitelisted', async () => {
      const logger = { warn: jest.fn() }

      const node = {
        definition: {
          id: 'balances',
          namespace: 'balances',
          factory: (deps) => deps,
          dependencies: ['balancesAtom', 'currencyAtom', 'featureFlagAtoms'],
        },
      }

      const balancesAtomDefinition = {
        definition: {
          id: 'balancesAtom',
          namespace: 'balances',
          factory: jest.fn(),
          dependencies: [],
        },
      }

      const [{ factory: createBalances }] = preprocess({
        dependencies: [node, balancesAtomDefinition],
        preprocessors: [readOnlyAtoms({ warn: true, logger })],
      })

      const { balancesAtom, currencyAtom, featureFlagAtoms } = createBalances({
        balancesAtom: createInMemoryAtom(),
        currencyAtom: createInMemoryAtom(),
        featureFlagAtoms: { dogeMode: createInMemoryAtom() },
      })

      await balancesAtom.set(123)
      await currencyAtom.set(456)
      await featureFlagAtoms.dogeMode.set(true)

      expect(logger.warn).toHaveBeenCalledTimes(2)
      expect(logger.warn).toHaveBeenNthCalledWith(
        1,
        '"balances" wrote to "currencyAtom" which is not writeable outside its namespace'
      )
      expect(logger.warn).toHaveBeenNthCalledWith(
        2,
        '"balances" wrote to "featureFlagAtoms.dogeMode" which is not writeable outside its namespace'
      )

      await expect(balancesAtom.get()).resolves.toBe(123)
      await expect(currencyAtom.get()).resolves.toBe(456)
      await expect(featureFlagAtoms.dogeMode.get()).resolves.toBe(true)
    })
  })
})
