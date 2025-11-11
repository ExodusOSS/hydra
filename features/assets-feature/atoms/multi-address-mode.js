import { combine, compute, createStorageAtomFactory } from '@exodus/atoms'
import { omitBy } from '@exodus/basic-utils'
import { createFusionAtom } from '@exodus/fusion-atoms'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { isUndefined } = lodash

const createMultiAddressModeAtom = ({ storage, fusion, logger, config }) => {
  const storageAtom = createStorageAtomFactory({ storage, logger })({
    key: 'multiAddressMode',
    defaultValue: config.defaults,
    isSoleWriter: true,
  })

  const bitcoinFusionAtom = createFusionAtom({
    fusion,
    path: `enableMultipleAddresses`,
  })

  const moneroFusionAtom = createFusionAtom({
    fusion,
    path: `moneroSubaddressesEnabled`,
  })

  const combinedAtom = combine({
    storage: storageAtom,
    bitcoin: bitcoinFusionAtom,
    monero: moneroFusionAtom,
  })

  const computedAtom = compute({
    atom: combinedAtom,
    selector: ({ storage, bitcoin, monero }) =>
      omitBy({ ...storage, bitcoin, monero }, isUndefined),
  })

  const set = async (value) => {
    const {
      bitcoin = false,
      monero = false,
      ...rest
    } = typeof value === 'function' ? value(await computedAtom.get()) : value

    await storageAtom.set(rest)

    // Do not write in fusion in parallel
    const moneroPreviousValue = await moneroFusionAtom.get()
    if (moneroPreviousValue !== monero) {
      await moneroFusionAtom.set(monero)
    }

    const bitcoinPreviousValue = await bitcoinFusionAtom.get()
    if (bitcoinPreviousValue !== bitcoin) {
      await bitcoinFusionAtom.set(bitcoin)
    }
  }

  const reset = async () => {
    await storageAtom.reset()
  }

  return { ...computedAtom, set, reset }
}

const multiAddressModeAtomDefinition = {
  id: 'multiAddressModeAtom',
  type: 'atom',
  factory: createMultiAddressModeAtom,
  dependencies: ['storage', 'fusion', 'logger', 'config'],
  public: true,
}

export default multiAddressModeAtomDefinition
