import { safeString } from '@exodus/safe-string'

export class UnableToSerializePublicKeyError extends Error {
  name = safeString`UnableToSerializePublicKeyError`
  constructor() {
    super(safeString`unable to serialize public key`)
  }
}

export class UnableToDeserializePublicKeyError extends Error {
  name = safeString`UnableToDeserializePublicKeyError`
  constructor() {
    super(safeString`unable to deserialize public key`)
  }
}

export class MissingWalletAccountParamError extends Error {
  name = safeString`MissingWalletAccountParamError`

  constructor() {
    super(safeString`Missing required param "walletAccount"`)
  }
}

export class MissingKeyIdentifierParamError extends Error {
  name = safeString`MissingKeyIdentifierParamError`

  constructor() {
    super(safeString`Missing required param "keyIdentifier"`)
  }
}

export class WalletAccountNotFoundError extends Error {
  name = safeString`WalletAccountNotFoundError`

  constructor(walletAccountName: string) {
    super(safeString`Wallet account with name ${walletAccountName} does not exist`)
  }
}

export class PublicKeyNotFoundError extends Error {
  name = safeString`PublicKeyNotFoundError`

  constructor(walletAccountName: string, derivationPath: string, derivationAlgorithm: string) {
    const keyIdentifier = `${derivationPath} (${derivationAlgorithm})`
    super(
      safeString`No public key found for ${walletAccountName} and key identifier ${keyIdentifier}`
    )
  }
}
