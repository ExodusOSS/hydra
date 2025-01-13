/* eslint-disable @typescript-eslint/no-unused-vars */
import AppTron from '@ledgerhq/hw-app-trx'
import assert from 'minimalistic-assert'
import { XPubUnsupportedError } from '@exodus/hw-common'
import * as secp256k1 from '@exodus/crypto/secp256k1'

import type Transport from '@ledgerhq/hw-transport'
import type {
  Bytes,
  GetAddressParams,
  GetPublicKeyParams,
  GetXPubParams,
  HardwareWalletAssetHandler,
  SignMessageParams,
  SignTransactionParams,
} from '@exodus/hw-common'

import applications from './applications'

export interface TronMessage {
  rawMessage?: Bytes

  TIP712Message?: {
    address: string
    message: Bytes
  }
}

async function createHandler(
  transport: Transport
): Promise<HardwareWalletAssetHandler<TronMessage>> {
  const app = new AppTron(transport as any)

  const getAddress = async (params: GetAddressParams) => {
    const { address } = await app.getAddress(params.derivationPath.replace('m/', ''))
    return address
  }

  const getXPub = async (params: GetXPubParams) => {
    throw new XPubUnsupportedError()
  }

  const getPublicKey = async (params: GetPublicKeyParams) => {
    const { publicKey } = await app.getAddress(params.derivationPath.replace('m/', ''))
    return secp256k1.publicKeyConvert({
      publicKey: Buffer.from(publicKey, 'hex'),
      compressed: true,
      format: 'buffer',
    })
  }

  const signTransaction = async (params: SignTransactionParams) => {
    assert(
      Array.isArray(params.derivationPaths) && params.derivationPaths.length === 1,
      'derivationsPath array must be one element long'
    )

    if (!Buffer.isBuffer(params.signableTransaction)) {
      throw new TypeError(`signableTransaction must be Buffer or serializable to a Buffer.`)
    }

    const signature = await app.signTransaction(
      params.derivationPaths[0].replace('m/', ''),
      params.signableTransaction.toString('hex'),
      []
    )
    return [
      {
        signature: Buffer.from(signature, 'hex'),
      },
    ]
  }

  const signMessage = async (params: SignMessageParams<TronMessage>) => {
    if (params.message.rawMessage) {
      assert(Buffer.isBuffer(params.message.rawMessage), 'rawMessage must be a buffer')
      const signature = await app.signPersonalMessage(
        params.derivationPath.replace('m/', ''),
        params.message.rawMessage.toString('hex')
      )
      return Buffer.from(signature, 'hex')
    }

    if (params.message.TIP712Message) {
      throw new Error('TIP712 messages are not yet supported')
    } else {
      assert(false, 'rawMessage or TIP712Message must be specified')
    }
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
  applications: [applications.Tron],
  handler: createHandler,
}

export default metadata
