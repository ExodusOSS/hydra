import * as secp256k1 from '@exodus/crypto/secp256k1'
import * as ethers from '@exodus/ethersproject-transactions'
import AppEth, { ledgerService } from '@exodus/ledgerhq-hw-app-eth'
import type { TypedMessage, MessageTypes } from '@metamask/eth-sig-util'
import { TypedDataUtils, SignTypedDataVersion } from '@metamask/eth-sig-util'
import assert from 'minimalistic-assert'

import type Transport from '@ledgerhq/hw-transport'
import type {
  GetAddressParams,
  GetPublicKeyParams,
  GetXPubParams,
  HardwareWalletAssetHandler,
  SignMessageParams,
  Message,
  SignTransactionParams,
} from '@exodus/hw-common'
import type { EIP712Message } from '@exodus/ledgerhq-hw-app-eth/lib/modules/EIP712/EIP712.types'

import { buildFauxXPUB } from './utils'
import { RequiresBlindSigningError } from '../errors'
import applications from './applications'

function hashEIP712Message(typedData: unknown) {
  const version = SignTypedDataVersion.V4

  const { sanitizeData, hashStruct } = TypedDataUtils
  const sanitizedData = sanitizeData(<TypedMessage<MessageTypes>>typedData)
  const domainSeparator = hashStruct(
    'EIP712Domain',
    sanitizedData.domain,
    sanitizedData.types,
    version
  )
  let hashStructMessage = Buffer.alloc(0)
  if (sanitizedData.primaryType !== 'EIP712Domain') {
    hashStructMessage = hashStruct(
      '' + sanitizedData.primaryType,
      sanitizedData.message,
      sanitizedData.types,
      version
    )
  }

  return {
    domainSeparator,
    hashStructMessage,
  }
}

function isEIP712Message(message: Record<string, unknown>): message is EIP712Message {
  return (
    typeof message === 'object' &&
    'types' in message &&
    'primaryType' in message &&
    'domain' in message &&
    'message' in message
  )
}

async function createHandler(transport: Transport): Promise<HardwareWalletAssetHandler> {
  const app = new AppEth(transport)

  return {
    getAddress: async (params: GetAddressParams) => {
      const { address } = await app.getAddress(params.derivationPath.replace('m/', ''))
      return address
    },

    getXPub: async (params: GetXPubParams) => {
      const { publicKey, chainCode } = await app.getAddress(
        params.derivationPath.replace('m/', ''),
        false,
        true
      )

      // Compress the public key in order to stay consistent with our codebase
      const compressedPublicKey = secp256k1.publicKeyConvert({
        publicKey: Buffer.from(publicKey, 'hex'),
        compressed: true,
        format: 'buffer',
      })

      return buildFauxXPUB(compressedPublicKey, Buffer.from(<string>chainCode, 'hex'))
    },

    getPublicKey: async (params: GetPublicKeyParams) => {
      // Ledger gives us an uncompressed public key in hex format
      const { publicKey } = await app.getAddress(params.derivationPath.replace('m/', ''))

      // Compress the public key in order to stay consistent with our codebase
      return secp256k1.publicKeyConvert({
        publicKey: Buffer.from(publicKey, 'hex'),
        compressed: true,
        format: 'buffer',
      })
    },

    signTransaction: async (params: SignTransactionParams) => {
      assert(
        Array.isArray(params.derivationPaths) && params.derivationPaths.length === 1,
        'derivationsPath array must be one element long'
      )
      assert(Buffer.isBuffer(params.signableTransaction), 'signableTransaction must be Buffer')

      const deserializedTransaction = ethers.parse(params.signableTransaction)

      /** TODO: retrieve from meta or bubble this up to the asset library "signHardware" */
      switch (params.assetName) {
        case 'ethereum': {
          deserializedTransaction.chainId = 1

          break
        }

        case 'matic': {
          deserializedTransaction.chainId = 137

          break
        }

        case 'basemainnet': {
          deserializedTransaction.chainId = 8453

          break
        }
        // No default
      }

      /** We need to delete the empty signature because otherwise ethers.js gets mad */
      delete deserializedTransaction.r
      delete deserializedTransaction.s
      delete deserializedTransaction.v

      // Serialize and cut off prefix '0x'
      const serializedTransactionHex = ethers.serialize(deserializedTransaction).slice(2)

      const signTransaction = async ({
        derivationPath,
        serializedTransactionHex,
        withNFT = true,
      }: {
        derivationPath: string
        serializedTransactionHex: string
        withNFT: boolean
      }) => {
        const resolution = await ledgerService.resolveTransaction(
          serializedTransactionHex,
          app.loadConfig,
          {
            externalPlugins: true,
            erc20: true,
            nft: withNFT,
          }
        )

        return app.signTransaction(derivationPath, serializedTransactionHex, resolution)
      }

      let response = null

      try {
        response = await signTransaction({
          derivationPath: params.derivationPaths[0],
          serializedTransactionHex,
          withNFT: true,
        })
      } catch (err: any) {
        if (err.name === 'EthAppNftNotSupported') {
          // Attempt to recover from this error by signing the transaction blindly
          // Alternatively we just need to check if device is Nano S before trying this
          // Note: sending NFTs on Nano S requires blind signing to be enabled
          response = await signTransaction({
            derivationPath: params.derivationPaths[0],
            serializedTransactionHex,
            withNFT: false,
          })
        } else if (err.name === 'EthAppPleaseEnableContractData') {
          throw new RequiresBlindSigningError()
        } else {
          throw err
        }
      }

      // Decomposed signature
      const { v, r, s } = response

      return [
        {
          signature: Buffer.concat([
            Buffer.from(v, 'hex'),
            Buffer.from(r, 'hex'),
            Buffer.from(s, 'hex'),
          ]),
        },
      ]
    },

    signMessage: async (params: SignMessageParams) => {
      const message = params.message as Message & {
        EIP712Message?: EIP712Message
      }

      let signingPromise

      if (message.rawMessage) {
        assert(Buffer.isBuffer(params.message.rawMessage), 'rawMessage must be a buffer')
        signingPromise = app.signPersonalMessage(
          params.derivationPath,
          Buffer.from(message.rawMessage).toString('hex')
        )
      } else if (message.EIP712Message) {
        assert(
          isEIP712Message(message.EIP712Message),
          'EIP712Message must be EIP712 conformant message'
        )
        signingPromise = app
          .signEIP712Message(params.derivationPath, message.EIP712Message)
          .catch((err: Error) => {
            // Signing EIP712 messages is not supported on the Nano S
            // Fallback to blind signing the message
            if (err.message.includes('INS_NOT_SUPPORTED')) {
              // Manually compute the domain & message hashes
              const { domainSeparator, hashStructMessage } = hashEIP712Message(
                message.EIP712Message
              )
              return app.signEIP712HashedMessage(
                params.derivationPath,
                domainSeparator.toString('hex'),
                hashStructMessage.toString('hex')
              )
            }

            throw err
          })
      } else {
        assert(false, 'rawMessage or EIP712Message must be specified')
      }

      const { r, s, v } = await signingPromise
      const vNorm = v.toString(16)
      const vHex = vNorm.length < 2 ? '0' + vNorm : vNorm
      return Buffer.from(`${r}${s}${vHex}`, 'hex')
    },
  }
}

const metadata = {
  applications: [applications.Ethereum],
  handler: createHandler,
}

export default metadata
