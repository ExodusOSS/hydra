import type { Definition } from '@exodus/dependency-types'
import type { TrezorDiscovery } from '../module/discovery'

type Dependencies = {
  trezorDiscovery: TrezorDiscovery
}

const createHardwareWalletTrezorPlugin = ({ trezorDiscovery }: Dependencies) => {
  const onUnlock = async () => {
    // Load credentials from storage and reset discovery state
    await trezorDiscovery.onUnlock()
  }

  const onLock = () => {
    // Mark as locked so we don't try to access storage
    trezorDiscovery.onLock()
  }

  const onStop = () => {
    void trezorDiscovery.stop()
  }

  return { onUnlock, onLock, onStop }
}

const hardwareWalletTrezorPluginDefinition = {
  id: 'hardwareWalletTrezorPlugin',
  type: 'plugin',
  factory: createHardwareWalletTrezorPlugin,
  dependencies: ['trezorDiscovery'],
  public: true,
} as const satisfies Definition

export default hardwareWalletTrezorPluginDefinition
