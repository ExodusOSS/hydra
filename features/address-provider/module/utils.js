import { Address, AddressSet } from '@exodus/models'
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import BipPath from 'bip32-path'
import { isNil } from '@exodus/basic-utils'
import KeyIdentifier from '@exodus/key-identifier'

const { groupBy } = lodash

export const resolvePurpose = ({ asset, address }) => {
  // Ideally, We should Unify the creation of Address object to always set the purpose
  if (address.meta.purpose !== undefined) {
    return address.meta.purpose
  }

  // TODO: store address.meta.purpose directly
  const purposeFromIndividualFlags = address.meta.isSegwit
    ? 84
    : address.meta.isNestedSegwit
      ? 49
      : address.meta.isTaproot
        ? 86
        : null

  if (purposeFromIndividualFlags !== null) {
    return purposeFromIndividualFlags
  }

  const addressString = address.toString()
  if (asset.address?.resolvePurpose) {
    return asset.address.resolvePurpose(addressString) || null
  }

  // fallback when resolvePurpose is not implemented (a default implementation could be like below though)
  if (asset.address?.validate) {
    try {
      return asset.address.validate(addressString) ? 44 : null
    } catch (e) {
      // some assets' validate may raise an error when invalid. imho, this should be fixed.
      console.warn(`${asset.name} asset.address.validate function raises an error!!!`, e)
    }
  }

  return null
}

export const getAddressesFromTxLog = ({ asset, txLog, walletAccount }) => {
  const changeAddresses = AddressSet.fromArray(
    [...txLog].map((tx) => tx.data?.changeAddress).filter(Boolean)
  )
    .toArray()
    .filter((address) => address.pathArray[0] === 1) // changeAddress may contain receive address

  const allAddresses = txLog.addresses.union(changeAddresses).sort(AddressSet.PATH_SORTER)

  return [...allAddresses].map((address) => {
    const purpose = resolvePurpose({ asset, address })

    const chainIndex = address.pathArray[0]
    const addressIndex = address.pathArray[1]
    return {
      address: new Address(address.toString(), {
        ...address.meta,
        purpose,
        walletAccount: walletAccount.toString(),
        keyIdentifier: new KeyIdentifier(
          asset.baseAsset.api.getKeyIdentifier({
            purpose,
            accountIndex: walletAccount.index,
            chainIndex,
            addressIndex,
            compatibilityMode: walletAccount.compatibilityMode,
          })
        ),
      }),
      purpose,
      chainIndex,
      addressIndex,
    }
  })
}

export const resolveUnusedAddressIndexesFromAddresses = ({
  addresses,
  purposes,
  highestUnusedIndexes,
}) => {
  const groupByPurpose = groupBy(addresses, 'purpose')
  const knownChains = [0, 1]
  return purposes.map((purpose) => ({
    purpose,
    chain: knownChains.map((thisChainIndex) =>
      (groupByPurpose[purpose] || [])
        .filter(({ chainIndex }) => thisChainIndex === chainIndex)
        .reduce(
          (acc, { addressIndex }) =>
            highestUnusedIndexes
              ? Math.max(addressIndex + 1, acc)
              : addressIndex === acc
                ? acc + 1
                : acc,
          0
        )
    ),
  }))
}

export const inclusiveRange = (end) => {
  return [...Array.from({ length: end }).keys(), end]
}

export const createPath = ({ chainIndex, addressIndex }) => {
  assert(
    !isNil(chainIndex) || isNil(addressIndex),
    'chainIndex must be provided if addressIndex is provided'
  )
  return BipPath.fromString(
    [chainIndex, addressIndex].filter((i) => !isNil(i)).join('/')
  ).toString()
}
