import type { ExodusApi } from '@exodus/headless'
import { DEFAULT_MNEMONIC, DEFAULT_PASSPHRASE } from './constants/index.js'

export default async function initialize(exodus: ExodusApi) {
  await exodus.application.start()
  await exodus.application.load()

  if (globalThis.__USE_DEFAULT_SEED__) {
    await exodus.application.import({ mnemonic: DEFAULT_MNEMONIC, passphrase: DEFAULT_PASSPHRASE })
    await exodus.application.unlock({ passphrase: DEFAULT_PASSPHRASE })
  }
}
