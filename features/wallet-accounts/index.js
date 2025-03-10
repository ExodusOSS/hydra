import { WalletAccount } from '@exodus/models'
import {
  enabledWalletAccountsAtomDefinition,
  walletAccountsAtomDefinition,
  activeWalletAccountAtomDefinition,
  multipleWalletAccountsEnabledAtomDefinition,
  hardwareWalletPublicKeysAtomDefinition,
  walletAccountsInternalAtomDefinition,
} from './atoms/index.js'
import walletAccountsDefinition from './module/index.js'
import walletAccountsApiDefinition from './api/index.js'
import {
  walletAccountsLifecyclePluginDefinition,
  multipleWalletAccountsPluginDefinition,
} from './plugins/index.js'
import walletAccountsReportDefinition from './report/index.js'
import allWalletAccountsEverDefinition from './debug/all-wallet-accounts-ever.js'
import walletAccountsDebugDefinition from './debug/index.js'
import typeforce from '@exodus/typeforce'

const walletAccounts = (
  {
    defaultLabel = WalletAccount.DEFAULT.label,
    defaultColor = WalletAccount.DEFAULT.color,
    allowedSources = [WalletAccount.EXODUS_SRC],
    fillIndexGapsOnCreation = false,
  } = Object.create(null)
) => {
  typeforce(
    {
      allowedSources: typeforce.arrayOf('String'),
      fillIndexGapsOnCreation: '?Boolean',
      defaultLabel: '?String',
      defaultColor: '?String',
    },
    {
      defaultLabel,
      defaultColor,
      allowedSources,
      fillIndexGapsOnCreation,
    },
    true
  )

  return {
    id: 'walletAccounts',
    definitions: [
      {
        definition: walletAccountsDefinition,
        config: { allowedSources, fillIndexGapsOnCreation },
      },
      {
        definition: walletAccountsInternalAtomDefinition,
        storage: { namespace: 'walletAccounts' },
        config: { defaultLabel, defaultColor },
      },
      {
        definition: walletAccountsAtomDefinition,
      },
      {
        definition: activeWalletAccountAtomDefinition,
        storage: { namespace: 'walletAccounts' },
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
      },
      { definition: multipleWalletAccountsEnabledAtomDefinition },
      { definition: enabledWalletAccountsAtomDefinition },
      {
        definition: walletAccountsApiDefinition,
      },
      {
        definition: walletAccountsLifecyclePluginDefinition,
        config: {
          defaultLabel,
        },
      },
      {
        definition: multipleWalletAccountsPluginDefinition,
      },
      {
        definition: hardwareWalletPublicKeysAtomDefinition,
        storage: { namespace: 'walletAccounts' },
      },
      {
        definition: walletAccountsReportDefinition,
      },
      {
        definition: walletAccountsDebugDefinition,
      },
      { definition: allWalletAccountsEverDefinition },
    ],
  }
}

export default walletAccounts
