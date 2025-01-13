import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

describe('isMnemonicValid', () => {
  let exodus = null

  let adapters

  beforeEach(async () => {
    adapters = createAdapters()
    const container = createExodus({ adapters, config })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
  })

  test('should be true for correct mnemonic', async () => {
    const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'

    expect(exodus.isMnemonicValid(mnemonic)).toBe(true)
  })

  test('should be false for incorrect mnemonic', async () => {
    const mnemonic = 'feri rec andrej mark jan alexes egor oli sarunas filip greg ryan'

    expect(exodus.isMnemonicValid(mnemonic)).toBe(false)
  })
})
