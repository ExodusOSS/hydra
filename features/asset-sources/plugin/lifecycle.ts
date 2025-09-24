import { createAtomObserver } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import type { AvailableAssetNamesByWalletAccount, Port } from '../types.js'
import type { Definition } from '@exodus/dependency-types'

type Dependencies<T> = {
  port: Port<T>
  availableAssetNamesByWalletAccountAtom: Atom<T>
}

const createAssetSourcesLifecyclePlugin = ({
  port,
  availableAssetNamesByWalletAccountAtom,
}: Dependencies<AvailableAssetNamesByWalletAccount>) => {
  const observer = createAtomObserver<AvailableAssetNamesByWalletAccount>({
    port,
    atom: availableAssetNamesByWalletAccountAtom,
    event: 'availableAssetNamesByWalletAccount',
    immediateRegister: false,
  })

  const onStart = () => {
    observer.register()
  }

  const onLoad = () => {
    void observer.start()
  }

  const onStop = () => {
    observer.unregister()
  }

  return { onLoad, onStart, onStop }
}

const AssetSourcesLifecyclePluginDefinition = {
  id: 'assetSourcesLifecyclePlugin',
  type: 'plugin',
  factory: createAssetSourcesLifecyclePlugin,
  dependencies: ['port', 'availableAssetNamesByWalletAccountAtom'],
  public: true,
} as const satisfies Definition

export default AssetSourcesLifecyclePluginDefinition
