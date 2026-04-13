import AppXrp from '@ledgerhq/hw-app-xrp'
import assert from 'minimalistic-assert'
import { XPubUnsupportedError, SignMessageUnsupportedError } from '@exodus/hw-common'
// @ts-expect-error - no types available
import binaryCodec from '@exodus/ripple-binary-codec'

import type Transport from '@ledgerhq/hw-transport'
import type {
  GetAddressParams,
  GetPublicKeyParams,
  HardwareWalletAssetHandler,
  SignTransactionParams,
} from '@exodus/hw-common'

import applications from './applications'

async function createHandler(transport: Transport): Promise<HardwareWalletAssetHandler> {
  const app = new AppXrp(transport as any)

  const getAddress = async (params: GetAddressParams) => {
    const { address } = await app.getAddress(params.derivationPath.replace('m/', ''))
    return address
  }

  const getXPub = async () => {
    throw new XPubUnsupportedError()
  }

  const getPublicKey = async (params: GetPublicKeyParams) => {
    const { publicKey } = await app.getAddress(params.derivationPath.replace('m/', ''))
    return Buffer.from(publicKey, 'hex')
  }

  const signTransaction = async (params: SignTransactionParams) => {
    assert(
      Array.isArray(params.derivationPaths) && params.derivationPaths.length === 1,
      'derivationsPath array must be one element long'
    )

    const { txData } = params.signableTransaction as any

    const derivationPath = params.derivationPaths[0].replace('m/', '')
    const { address, publicKey } = await app.getAddress(derivationPath)

    const txForSigning = {
      ...txData,
      Account: address,
      SigningPubKey: publicKey.toUpperCase(),
    }

    const encoded = binaryCodec.encode(txForSigning)

    const signature = await app.signTransaction(derivationPath, encoded)
    return [
      {
        signature: Buffer.from(signature, 'hex'),
        publicKey: Buffer.from(publicKey, 'hex'),
      },
    ]
  }

  const signMessage = async () => {
    // Ripple/XRP doesn't have a standard message signing protocol
    throw new SignMessageUnsupportedError()
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
  applications: [applications.XRP],
  handler: createHandler,
}

export default metadata
