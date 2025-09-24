// import Transport from '@ledgerhq/hw-transport-node-speculos'
import BIP32 from '@exodus/bip32'
import Zemu, { DEFAULT_START_OPTIONS } from '@zondax/zemu'

import { assetApplications } from '../assets'
import { fixtures } from './fixtures'
import { ASSET_NAME_TO_ELF_NAME_MAP, DEBUG } from './metadata'
import { getAppPath } from './utils'

jest.setTimeout(4 * 60 * 1000)

export default function integrationSuite(assetName, metadata, fixture) {
  describe(assetName, () => {
    /* Setup asset specific fixtures & grab supported models & app versions */
    const { applicationName, baseAssetName, models, appVersions } = metadata

    describe.each(models)('%s', (model) => {
      describe.each(appVersions)('%s', (appVersion) => {
        let assetHandler = null

        const appElf = getAppPath({ applicationName, model, appVersion })
        /* Some apps require another app to be installed as library */
        const libElf = baseAssetName
          ? {
              [ASSET_NAME_TO_ELF_NAME_MAP[baseAssetName]]: getAppPath({
                applicationName: baseAssetName,
                model,
                appVersion,
              }),
            }
          : undefined
        let sim = null

        beforeEach(async () => {
          sim = new Zemu(appElf, libElf)
          const options = {
            ...DEFAULT_START_OPTIONS,
            model,
            logging: DEBUG,
            custom: `-s "${fixtures.mnemonic}"`,
            startTimeout: 60_000,
          }
          if (model === 'stax') options.startText = 'This app'
          await sim.start(options)

          // const transport = await Transport.open({ apduPort: 40_000 })
          const transport = sim.getTransport()
          const { handler } = assetApplications[assetName]
          assetHandler = await handler(transport)
        })

        afterEach(async () => {
          await sim.close()
        })

        if (fixture.addresses) {
          describe('.getAddress()', () => {
            it.each(Object.entries(fixture.addresses))(
              'getting address for %p',
              async (derivationPath, expectedAddress) => {
                const address = await assetHandler.getAddress({
                  derivationPath,
                })
                expect(address).toBe(expectedAddress)
              }
            )
          })
        }

        if (fixture.xpubs) {
          describe('.getXPub()', () => {
            it.each(Object.entries(fixture.xpubs))(
              'getting xpub for %p',
              async (derivationPath, expectedXPub) => {
                const xpub = await assetHandler.getXPub({
                  derivationPath,
                })
                expect(xpub).toEqual(expectedXPub)

                const hdkey = BIP32.fromXPub(xpub)
                const { publicKey } = hdkey.derive('m/0/0')
                const expectedPublicKey = fixture.publicKeys[derivationPath + '/0/0']
                expect(publicKey.toString('hex')).toBe(expectedPublicKey)
              }
            )
          })
        }

        if (fixture.publicKeys) {
          describe('.getPublicKey()', () => {
            it.each(Object.entries(fixture.publicKeys))(
              'getting publicKey for %p',
              async (derivationPath, expectedPublicKey) => {
                const publicKey = await assetHandler.getPublicKey({
                  derivationPath,
                })
                expect(publicKey.toString('hex')).toEqual(expectedPublicKey)
              }
            )
          })
        }

        if (fixture.transactions) {
          describe('.signTransaction()', () => {
            it.each(fixture.transactions)(
              'signing transaction',
              async ({ skipModels, customApproveNavigation, params, result }) => {
                if (skipModels?.includes(model)) return

                const signedTransactionPromise = assetHandler.signTransaction(params)

                const navigationSteps = (customApproveNavigation &&
                  customApproveNavigation[model]) || ['Hold|Approve|Accept']

                for (const navigationStep of navigationSteps) {
                  const navigationFunc = Number.isInteger(navigationStep)
                    ? sim.navigate.bind(sim)
                    : sim.navigateUntilText.bind(sim)

                  // "Accept" -> "Accept"
                  // 1 -> [1]
                  const formatedStep = Number.isInteger(navigationStep)
                    ? [navigationStep]
                    : navigationStep

                  const pressButtonsPromise = navigationFunc(
                    'debug',
                    `${assetName}-${appVersion}-${model}-sign-transaction`,
                    formatedStep,
                    true,
                    DEBUG
                  )
                  /**
                   * Always race pressing button presses vs the actual call
                   * to prevent infinite button pressing loops.
                   */
                  await Promise.race([signedTransactionPromise, pressButtonsPromise])
                  await sim.deleteEvents()
                }

                const signatures = await signedTransactionPromise

                if (typeof result === 'function') {
                  result(signatures)
                } else {
                  expect(Array.isArray(signatures)).toBe(true)
                  signatures.forEach(({ signature }, index) => {
                    expect(signature.toString('hex')).toEqual(result[index])
                  })
                }
              }
            )
          })
        }

        if (fixture.messages) {
          describe('.signMessage()', () => {
            it.each(fixture.messages)(
              'signing messages',
              async ({ customApproveNavigation, params, result }) => {
                const canStartNavigation = sim.waitUntilScreenIsNot(await sim.snapshot())
                const signedMessagePromise = assetHandler.signMessage(params)
                await canStartNavigation

                const navigationSteps = (customApproveNavigation &&
                  customApproveNavigation[model]) || ['Hold|Approve|Accept']

                for (const navigationStep of navigationSteps) {
                  const navigationFunc = Number.isInteger(navigationStep)
                    ? sim.navigate.bind(sim)
                    : sim.navigateUntilText.bind(sim)

                  // "Accept" -> "Accept"
                  // 1 -> [1]
                  const formatedStep = Number.isInteger(navigationStep)
                    ? [navigationStep]
                    : navigationStep

                  const pressButtonsPromise = navigationFunc(
                    'debug',
                    `${assetName}-${appVersion}-${model}-sign-message`,
                    formatedStep,
                    true,
                    DEBUG,
                    0,
                    6000,
                    true,
                    false
                  )
                  /**
                   * Always race pressing button presses vs the actual call
                   * to prevent infinite button pressing loops.
                   */
                  await Promise.race([signedMessagePromise, pressButtonsPromise])
                  await sim.deleteEvents()
                }

                const signedMessage = await signedMessagePromise
                if (typeof result === 'function') {
                  result(signedMessage)
                } else {
                  expect(signedMessage.toString('hex')).toEqual(result)
                }
              }
            )
          })
        }
      })
    })
  })
}
