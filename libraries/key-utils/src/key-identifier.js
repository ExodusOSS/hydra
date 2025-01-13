import assert from 'minimalistic-assert'
import { buildDerivationPath } from './derivation-path.js'
import { DEFAULT_PURPOSE, DEFAULT_CHAIN_INDEX, DEFAULT_ADDRESS_INDEX } from './constants.js'

export const isSafeObject = (value) => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null
}

export const isSafeNonNegativeInteger = (value) => {
  return typeof value === 'number' && value >= 0 && Number.isSafeInteger(value)
}

export const assertKeyIdentifierParameters = (params, rules = {}) => {
  assert(isSafeObject(params), 'arguments for getKeyIdentifier were not an object')
  assert(isSafeObject(rules), 'rules for getKeyIdentifier were not an object')

  const {
    allowedPurposes = [DEFAULT_PURPOSE],
    allowedChainIndices = [DEFAULT_CHAIN_INDEX],
    allowMultipleAddresses = false,
    allowXPUB = false,
  } = rules

  assert(Array.isArray(allowedPurposes), 'rules.allowedPurposes has to be an array')
  assert(Array.isArray(allowedChainIndices), 'rules.allowedChainIndices has to be an array')
  assert(
    typeof allowMultipleAddresses === 'boolean',
    'rules.allowMultipleAddresses has to be a boolean'
  )
  assert(typeof allowXPUB === 'boolean', 'rules.allowXPUB has to be a boolean')

  const { purpose, accountIndex, chainIndex, addressIndex, compatibilityMode } = params

  assert(
    allowedPurposes.includes(purpose),
    `purpose was ${purpose}, which is not allowed. Can be one of the following: ${allowedPurposes.join(
      ', '
    )}`
  )
  assert(isSafeNonNegativeInteger(accountIndex), 'accountIndex must be a non-negative integer')
  if (chainIndex !== undefined) {
    assert(isSafeNonNegativeInteger(chainIndex), 'chainIndex must be a non-negative integer')

    assert(
      allowedChainIndices.includes(chainIndex),
      `setting chainIndex to value other than ${allowedChainIndices.join(', ')} is not supported`
    )
  }

  if (addressIndex !== undefined) {
    assert(isSafeNonNegativeInteger(addressIndex), 'addressIndex must be a non-negative integer')

    if (!allowMultipleAddresses) {
      assert(
        addressIndex === DEFAULT_ADDRESS_INDEX,
        'addressIndex must be zero or undefined if multiple address mode is disabled'
      )
    }
  }

  if (!allowXPUB) {
    assert(
      chainIndex !== undefined && addressIndex !== undefined,
      'chainIndex & addressIndex must be defined if XPUB derivation is not allowed'
    )
  }

  if (compatibilityMode) {
    assert(typeof compatibilityMode === 'string', `compatibilityMode, if defined, must be a string`)
  }
}

/**
 * Factory to create a getKeyIdentifier function
 * @param {object} options
 * @param {number} options.bip44 coin type as defined in SLIP-0044
 * @param {string} [options.derivationAlgorithm]  Can be either 'BIP32' or 'SLIP10'
 * @param {string} [options.keyType] Can be 'legacy', 'secp256k1', or 'nacl'
 * @param {string} [options.assetName] required when keyType === 'legacy'
 * @param {{allowedChainIndices: number[], allowedPurposes: number[], allowMultipleAddresses: boolean, allowXPUB: boolean }} [options.validationRules]
 */
export function createGetKeyIdentifier({
  bip44,
  assetName,
  derivationAlgorithm = 'BIP32',
  keyType = 'secp256k1',
  validationRules,
}) {
  return (params) => {
    if (validationRules?.allowXPUB === undefined) {
      validationRules = {
        ...validationRules,
        allowXPUB: derivationAlgorithm === 'BIP32' && keyType === 'secp256k1',
      }
    }

    assertKeyIdentifierParameters(params, validationRules)

    const { accountIndex, addressIndex, chainIndex, purpose = DEFAULT_PURPOSE } = params

    const derivationPath = buildDerivationPath({
      derivationAlgorithm,
      purpose,
      bip44,
      accountIndex,
      chainIndex,
      addressIndex,
    })

    return {
      assetName,
      derivationAlgorithm,
      derivationPath,
      keyType,
    }
  }
}
