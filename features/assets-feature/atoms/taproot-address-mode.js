import { compute } from '@exodus/atoms'
import { createFusionAtom } from '@exodus/fusion-atoms'

const createTaprootAddressModeAtom = ({ fusion }) => {
  const bitcoinFusionAtom = createFusionAtom({
    fusion,
    path: `bitcoinTaprootAddressEnabled`,
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

const taprootAddressModeAtomDefinition = {
  id: 'taprootAddressModeAtom',
  type: 'atom',
  factory: createTaprootAddressModeAtom,
  dependencies: ['fusion'],
  public: true,
}

export default taprootAddressModeAtomDefinition
