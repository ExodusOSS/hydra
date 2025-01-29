import { compute } from '@exodus/atoms'
import { createFusionAtom } from '@exodus/fusion-atoms'

const createLegacyAddressModeAtom = ({ fusion }) => {
  const bitcoinFusionAtom = createFusionAtom({
    fusion,
    path: `bitcoinLegacyAddressEnabled`,
  })

  const computedAtom = compute({
    atom: bitcoinFusionAtom,
    selector: (bitcoin) => (bitcoin === undefined ? {} : { bitcoin }),
  })

  const set = async (value) => {
    const { bitcoin } = typeof value === 'function' ? value(await computedAtom.get()) : value

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
  dependencies: ['fusion'],
  public: true,
}

export default legacyAddressModeAtomDefinition
