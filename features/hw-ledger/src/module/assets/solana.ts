/* eslint-disable @typescript-eslint/no-unused-vars */
import AppSolana from '@ledgerhq/hw-app-solana'
import assert from 'minimalistic-assert'
import bs58 from 'bs58'
import { XPubUnsupportedError } from '@exodus/hw-common'

import type Transport from '@ledgerhq/hw-transport'
import type {
  GetAddressParams,
  GetPublicKeyParams,
  GetXPubParams,
  HardwareWalletAssetHandler,
  SignMessageParams,
  SignTransactionParams,
} from '@exodus/hw-common'

import { RequiresBlindSigningError } from '../errors'
import applications from './applications'

async function createHandler(transport: Transport): Promise<HardwareWalletAssetHandler> {
  const app = new AppSolana(transport)

  const getAddress = async (params: GetAddressParams) => {
    const { address } = await app.getAddress(params.derivationPath.replace('m/', ''))
    return bs58.encode(address)
  }

  const getXPub = async (params: GetXPubParams) => {
    throw new XPubUnsupportedError()
  }

  const getPublicKey = async (params: GetPublicKeyParams) => {
    // Addresses in Solana are just Base58 encoded strings of 32 byte ed25519 public keys.
    const { address } = await app.getAddress(params.derivationPath.replace('m/', ''))
    return address
  }

  const signTransaction = async (params: SignTransactionParams) => {
    assert(
      Array.isArray(params.derivationPaths) && params.derivationPaths.length === 1,
      'derivationsPath array must be one element long'
    )

    let serializedTransaction
    if (Buffer.isBuffer(params.signableTransaction)) {
      serializedTransaction = params.signableTransaction
    } else if (params.signableTransaction instanceof Uint8Array) {
      serializedTransaction = Buffer.from(params.signableTransaction)
    } else if ((params.signableTransaction as any).serialize) {
      serializedTransaction = Buffer.from((params.signableTransaction as any).serialize())
    }

    if (!Buffer.isBuffer(serializedTransaction)) {
      throw new TypeError(`signableTransaction must be Buffer or serializable to a Buffer.`)
    }

    const { signature } = await app
      .signTransaction(params.derivationPaths[0].replace('m/', ''), serializedTransaction)
      .catch((err: any) => {
        if (err.message.includes('Try enabling blind signature in the app')) {
          throw new RequiresBlindSigningError()
        } else {
          throw err
        }
      })

    const { address: publicKey } = await app.getAddress(params.derivationPaths[0].replace('m/', ''))

    return [
      {
        publicKey,
        signature,
      },
    ]
  }

  const signMessage = async (params: SignMessageParams) => {
    assert(Buffer.isBuffer(params.message.rawMessage), 'rawMessage must be a buffer')
    const { signature } = await app.signOffchainMessage(
      params.derivationPath.replace('m/', ''),
      params.message.rawMessage
    )
    return signature
  }

  return {
    getAddress,
    getPublicKey,
    getXPub,
    signTransaction,
    signMessage,
  }
}

const metadata = {
  applications: [applications.Solana],
  handler: createHandler,
}

export default metadata
