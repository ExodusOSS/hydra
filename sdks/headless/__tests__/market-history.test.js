import marketHistory from '@exodus/market-history'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

function cropLevels(obj, level = 0, cropLevel = 3) {
  if (level === cropLevel) {
    return 'data'
  }

  const result = {}

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = cropLevels(obj[key], level + 1)
    } else {
      result[key] = obj[key]
    }
  }

  return result
}

describe('market-history', () => {
  let exodus

  let adapters

  let marketHistoryAtom

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    const container = createExodus({ adapters, config })

    container.use(marketHistory())

    exodus = container.resolve()

    marketHistoryAtom = container.get('marketHistoryAtom')

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
  })

  const getObserverCall = async (callNumber) => {
    return new Promise((resolve) => {
      let calls = 0
      marketHistoryAtom.observe((data) => {
        calls++
        if (calls === callNumber) {
          resolve(cropLevels(data, 0, 3))
        }
      })
    })
  }

  test('should load default currency market-history data', async () => {
    const result = await getObserverCall(2)
    expect(result).toEqual({
      data: {
        USD: {
          daily: 'data',
          hourly: 'data',
        },
      },
    })
  })

  test('should load market-history data when currency changes', async () => {
    jest.setTimeout(20_000)

    const secondCallResult = {
      data: {
        USD: {
          daily: 'data',
          hourly: 'data',
        },
      },
    }

    const result = await getObserverCall(2)
    await expect(result).toEqual(secondCallResult)

    await exodus.locale.setCurrency('EUR')

    const thirdCall = await getObserverCall(3)

    expect({
      data: {
        EUR: {
          hourly: 'data',
          daily: 'data',
        },
        USD: {
          daily: 'data',
          hourly: 'data',
        },
      },
    }).toEqual(thirdCall)
  })
})
