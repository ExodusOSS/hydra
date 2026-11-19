import { safeString } from '@exodus/safe-string'

import walletApiDefinition from '../api/index.js'
import hasPassphraseSetAtomDefinition from '../atoms/has-passphrase-set.js'
import primarySeedIdAtomDefinition from '../atoms/primary-seed-id.js'
import walletExistsAtomDefinition from '../atoms/wallet-exists.js'
import walletLifecyclePluginDefinition from '../plugin/index.js'

const SYNCHRONIZATION_ERROR_HINTS = {
  create: safeString`wallet-rpc: create/state-synchronization`,
  import: safeString`wallet-rpc: import/state-synchronization`,
  changePassphrase: safeString`wallet-rpc: change-passphrase/state-synchronization`,
  clear: safeString`wallet-rpc: clear/state-synchronization`,
}

const synchronizeAfterMutation = async ({ errorTracking, logger, operation, synchronize }) => {
  try {
    await synchronize()
  } catch (error) {
    const trackedError =
      error instanceof Error
        ? error
        : new Error(safeString`wallet-rpc state synchronization failed`, { cause: error })

    Object.assign(trackedError, { hint: SYNCHRONIZATION_ERROR_HINTS[operation] })
    logger.warn(`failed to synchronize wallet state after ${operation}`, trackedError)

    void (async () => {
      try {
        await errorTracking.track({ error: trackedError, namespace: safeString`wallet-rpc` })
      } catch (trackingError) {
        logger.error('failed to track wallet state synchronization error', trackingError)
      }
    })()
  }
}

const walletRpc = (api) => {
  const id = 'wallet'

  const createWalletRpcProxy = ({
    primarySeedIdAtom,
    walletExistsAtom,
    hasPassphraseSetAtom,
    errorTracking,
    logger,
  }) =>
    new Proxy(api, {
      get(target, prop) {
        if (prop === 'unlock') {
          return async (...args) => {
            const { primarySeedId } = await target.unlock(...args)
            await primarySeedIdAtom.set(primarySeedId)
            return primarySeedId
          }
        }

        if (prop === 'create' || prop === 'import') {
          return async (...args) => {
            const result = await target[prop](...args)
            await Promise.all([
              synchronizeAfterMutation({
                errorTracking,
                logger,
                operation: prop,
                synchronize: () => walletExistsAtom.set(true),
              }),
              synchronizeAfterMutation({
                errorTracking,
                logger,
                operation: prop,
                synchronize: async () => {
                  await hasPassphraseSetAtom.set(await target.hasPassphraseSet())
                },
              }),
            ])
            return result
          }
        }

        if (prop === 'changePassphrase') {
          return async (...args) => {
            const result = await target.changePassphrase(...args)
            await synchronizeAfterMutation({
              errorTracking,
              logger,
              operation: prop,
              synchronize: async () => {
                await hasPassphraseSetAtom.set(await target.hasPassphraseSet())
              },
            })
            return result
          }
        }

        if (prop === 'clear') {
          return async (...args) => {
            const result = await target.clear(...args)
            await Promise.all([
              synchronizeAfterMutation({
                errorTracking,
                logger,
                operation: prop,
                synchronize: () => walletExistsAtom.set(false),
              }),
              synchronizeAfterMutation({
                errorTracking,
                logger,
                operation: prop,
                synchronize: () => hasPassphraseSetAtom.set(false),
              }),
            ])
            return result
          }
        }

        return target[prop]
      },
    })

  return {
    id,
    definitions: [
      { definition: primarySeedIdAtomDefinition },
      { definition: walletExistsAtomDefinition },
      { definition: hasPassphraseSetAtomDefinition },
      {
        definition: {
          id,
          type: 'module',
          public: true,
          factory: createWalletRpcProxy,
          dependencies: [
            'primarySeedIdAtom',
            'walletExistsAtom',
            'hasPassphraseSetAtom',
            'errorTracking',
            'logger',
          ],
        },
      },
      { definition: walletApiDefinition },
      { definition: walletLifecyclePluginDefinition },
    ],
  }
}

export default walletRpc
