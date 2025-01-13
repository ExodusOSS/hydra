import bitcoin from './bitcoin'
import basemainnet from './basemainnet'
import ethereum from './ethereum'
import matic from './matic'
import solana from './solana'
import tronmainnet from './tronmainnet'
import applications from './applications'

import type Transport from '@ledgerhq/hw-transport'
import type { HardwareWalletAssetHandler } from '@exodus/hw-common'
import type { Atom } from '@exodus/atoms'

type HandlerFactory = (
  transport: Transport,
  walletPolicyAtom?: Atom<Record<string, Buffer>>
) => Promise<HardwareWalletAssetHandler>

type AssetMetadata = {
  applications: {
    applicationName: string
    primaryAssetName: string
    supportedVersions: string
  }[]
  handler: HandlerFactory
}

export const assetApplications: Record<string, AssetMetadata> = {
  basemainnet,
  bitcoin,
  bitcointestnet: bitcoin,
  bitcoinregtest: bitcoin,
  matic,
  solana,
  ethereum,
  ethereumsepolia: ethereum,
  tronmainnet,
}

/**
 * The baseAssetNames that are supported by our implementation.
 * e.g: ['bitcoin', 'ethereum', 'matic', 'solana']
 */
export const supportedBaseAssetNames = Object.keys(assetApplications)

/**
 * An object containing a map that maps the asset application name
 * to their respective baseAssetName.
 * e.g { "Bitcoin": ["bitcoin"], "Ethereum": ["ethereum", "matic"], }
 */
export const applicationNameToBaseAssetNames: Record<string, string[]> = Object.entries(
  assetApplications
).reduce((mapping, [assetName, metadata]) => {
  // Loop over all supported applications for a given asset name
  for (const { applicationName } of metadata.applications) {
    if (!Array.isArray(mapping[applicationName])) {
      // Create an empty array if it doesn't exist
      mapping[applicationName] = []
    }

    const isPrimaryAssetForApplication: boolean =
      (applications as any)[applicationName]?.primaryAssetName === assetName
    // Add the assetName to the mapping
    if (isPrimaryAssetForApplication) {
      // Push to front of array, since the first assetName in the list
      // is the primary asset to display
      mapping[applicationName].unshift(assetName)
    } else {
      // Push at the end of the array
      mapping[applicationName].push(assetName)
    }
  }

  return mapping
}, Object.create(null))
