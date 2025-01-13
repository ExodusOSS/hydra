import { createAtomObserver } from '@exodus/atoms'

import type { Atom } from '@exodus/atoms'
import type { Port } from '../shared/types'
import type { Definition } from '@exodus/dependency-types'
import type { WalletAccountNameToConnectedAssetNamesMap } from '../atoms/index.js'

const createHardwareWalletsPlugin = ({
  hardwareWalletConnectedAssetNamesAtom,
  port,
}: {
  hardwareWalletConnectedAssetNamesAtom: Atom<WalletAccountNameToConnectedAssetNamesMap>
  port: Port
}) => {
  const observers = [
    createAtomObserver({
      atom: hardwareWalletConnectedAssetNamesAtom,
      port,
      event: 'hardwareWalletConnectedAssetNames',
    }),
  ]
  observers.forEach((observer) => observer.register())

  const start = () => {
    observers.forEach((observer) => observer.start())
  }

  const stop = () => {
    observers.forEach((observer) => observer.unregister())
  }

  const onUnlock = () => {
    start()
  }

  const onLoad = () => {
    start()
  }

  const onStop = () => {
    stop()
  }

  return { onUnlock, onLoad, onStop }
}

const hardwareWalletsPluginDefinition = {
  id: 'hardwareWalletsPlugin',
  type: 'plugin',
  factory: createHardwareWalletsPlugin,
  dependencies: ['hardwareWalletConnectedAssetNamesAtom', 'port'],
} as const satisfies Definition

export default hardwareWalletsPluginDefinition
