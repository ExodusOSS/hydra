import { createAtomObserver } from '@exodus/atoms'
import { mapValues, pickBy } from '@exodus/basic-utils'

const createAssetsPlugin = ({
  port,
  assetsModule,
  assetsAtom,
  customTokensMonitor,
  disabledPurposesAtom,
  multiAddressModeAtom,
  legacyAddressModeAtom,
  taprootAddressModeAtom,
}) => {
  const emitAssets = async (assets) => {
    if (!assets) {
      ;({ value: assets } = await assetsAtom.get())
    }

    const payload = {
      assets,
      defaultAccountStates: mapValues(
        pickBy(assets, (asset) => asset.api?.hasFeature?.('accountState')),
        (asset) => asset.api.createAccountState().create()
      ),
    }

    port.emit('assets', payload)
  }

  const observers = [
    createAtomObserver({ atom: disabledPurposesAtom, port, event: 'disabledPurposes' }),
    createAtomObserver({ atom: multiAddressModeAtom, port, event: 'multiAddressMode' }),
    createAtomObserver({ atom: legacyAddressModeAtom, port, event: 'legacyAddressMode' }),
    createAtomObserver({ atom: taprootAddressModeAtom, port, event: 'taprootAddressMode' }),
  ]

  const subscribers = []

  const onStart = async () => {
    let emittedInitialAssets = false
    subscribers.push(
      assetsAtom.observe(async ({ value, added, updated, disabled }) => {
        if (!emittedInitialAssets) {
          await emitAssets(value)
          emittedInitialAssets = true
        }

        if (added.length > 0) {
          port.emit('assets-add', added)
        }

        if (updated.length > 0) {
          port.emit('assets-update', updated)
        }

        if (disabled.length > 0) {
          port.emit('assets-disable', disabled)
        }
      })
    )

    observers.forEach((observer) => observer.register())
    await assetsModule.load()
  }

  const onLoad = async () => {
    observers.forEach((observer) => observer.start())
    await assetsModule.load()
    await emitAssets()
  }

  const onUnlock = () => {
    customTokensMonitor?.start()
  }

  const onLock = () => {
    customTokensMonitor?.stop()
  }

  const onStop = () => {
    observers.forEach((observer) => observer.unregister())
    subscribers.forEach((unsubscribe) => unsubscribe())
  }

  const onClear = async () => {
    await assetsModule.clear()
  }

  return { onStart, onLoad, onUnlock, onLock, onStop, onClear }
}

const assetsPluginDefinition = {
  id: 'assetsPlugin',
  type: 'plugin',
  factory: createAssetsPlugin,
  dependencies: [
    'port',
    'assetsModule',
    'assetsAtom',
    'customTokensMonitor?',
    'disabledPurposesAtom',
    'multiAddressModeAtom',
    'legacyAddressModeAtom',
    'taprootAddressModeAtom',
  ],
  public: true,
}

export default assetsPluginDefinition
