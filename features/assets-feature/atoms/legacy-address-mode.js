import { combine, compute, createStorageAtomFactory } from '@exodus/atoms'
import { createFusionAtom } from '@exodus/fusion-atoms'

const createLegacyAddressModeAtom = ({ storage, fusion, logger }) => {
  const storageAtom = createStorageAtomFactory({ storage, logger })({
    key: 'legacyAddressMode',
    defaultValue: {},
    isSoleWriter: true,
  })

  const bitcoinFusionAtom = createFusionAtom({
    fusion,
    path: `bitcoinLegacyAddressEnabled`,
  })

  const computedAtom = compute({
    atom: combine({ storage: storageAtom, bitcoin: bitcoinFusionAtom }),
    selector: ({ storage, bitcoin }) => (bitcoin === undefined ? storage : { ...storage, bitcoin }),
  })

  const set = async (value) => {
    const { bitcoin, ...rest } =
      typeof value === 'function' ? value(await computedAtom.get()) : value

    await storageAtom.set(rest)

    const bitcoinPreviousValue = await bitcoinFusionAtom.get()
    if (bitcoinPreviousValue !== bitcoin) {
      await bitcoinFusionAtom.set(bitcoin || false)
    }
  }

  return { ...computedAtom, set }
}

const legacyAddressModeAtomDefinition = {
  id: 'legacyAddressModeAtom',
  type: 'atom',
  factory: createLegacyAddressModeAtom,
  dependencies: ['storage', 'fusion', 'logger'],
  public: true,
}

export default legacyAddressModeAtomDefinition
