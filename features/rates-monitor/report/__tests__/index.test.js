import { createInMemoryAtom } from '@exodus/atoms'
import ratesReportDefinition from '..'

describe('ratesReport', () => {
  const ratesData = {
    USD: {
      BTC: {
        cap: 567_576_644_105.831,
        change24: 0.403_608_049_185_762_43,
        invalid: false,
        price: 29_184.994_721_999_996,
        priceUSD: 29_184.994_721_999_996,
        volume24: 12_638_942_283.927_006,
      },
      ETH: {
        cap: 220_260_084_127.356_96,
        change24: -0.049_765_058_552_094_81,
        invalid: false,
        price: 1832.932_574_925_282_3,
        priceUSD: 1832.932_574_925_282_3,
        volume24: 4_674_187_018.018_133,
      },
    },
  }

  const setup = (data = ratesData) => ({
    ratesAtom: createInMemoryAtom({ defaultValue: data }),
  })

  it('should provide the correct namespace', async () => {
    const { ratesAtom } = setup()

    const report = ratesReportDefinition.factory({ ratesAtom })

    expect(report.namespace).toEqual('rates')
  })

  it('should report asset names of the first currency', async () => {
    const { ratesAtom } = setup()

    const report = ratesReportDefinition.factory({ ratesAtom })
    const result = await report.export()

    expect(result).toEqual(Object.keys(ratesData.USD))
  })

  it('should report an empty array if rates are not loaded yet', async () => {
    const { ratesAtom } = setup({})

    const report = ratesReportDefinition.factory({ ratesAtom })
    const result = await report.export()

    expect(result).toEqual([])
  })

  it('should reject when data could not be loaded', async () => {
    const { ratesAtom } = setup()

    const error = new Error('Could not load rates')
    jest.spyOn(ratesAtom, 'get').mockRejectedValueOnce(error)

    const report = ratesReportDefinition.factory({ ratesAtom })

    await expect(report.export()).rejects.toEqual(error)
  })
})
