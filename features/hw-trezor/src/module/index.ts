import { TrezorDiscovery } from './discovery'
import type { Logger } from '@exodus/logger'
import type { Atom } from '@exodus/atoms'
import type { HwTrezorConfig } from '../index'

export type Dependencies = {
  platformInfo: any
  hardwareWalletPairingPromptAtom: Atom<boolean>
  hardwareWalletThpCredentialsAtom: Atom<any>
  logger: Logger
  config: HwTrezorConfig
  assetsModule: any
}

const createTrezorDiscovery = (deps: Dependencies) =>
  new TrezorDiscovery(
    deps.platformInfo,
    deps.hardwareWalletPairingPromptAtom,
    deps.hardwareWalletThpCredentialsAtom,
    deps.logger,
    deps.config,
    deps.assetsModule
  )

export default {
  id: 'trezorDiscovery',
  type: 'module',
  factory: createTrezorDiscovery,
  dependencies: [
    'platformInfo',
    'hardwareWalletPairingPromptAtom',
    'hardwareWalletThpCredentialsAtom',
    'logger',
    'config',
    'assetsModule',
  ],
  public: true,
} as const
