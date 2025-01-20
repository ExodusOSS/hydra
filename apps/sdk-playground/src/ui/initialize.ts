import type { ExodusApi } from '@exodus/headless'

// also used in integration tests
const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
const passphrase = 'abracadabra'

export default async function initialize(exodus: ExodusApi) {
  await exodus.application.start()
  await exodus.application.load()
  await exodus.application.import({ mnemonic, passphrase })
  await exodus.application.unlock({ passphrase })
}
