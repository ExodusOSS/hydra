import fiat from '@exodus/fiat-currencies'

import { fiatBalancesAtomDefinition } from '../../atoms'
import fiatBalancesReportDefinition from '..'

const { factory: createFiatBalancesAtom } = fiatBalancesAtomDefinition
const { factory: createFiatBalancesReportReport } = fiatBalancesReportDefinition

export const createFiatNumberUnit = (value) => fiat.USD.defaultUnit(value)

describe('fiatBalancesReport', () => {
  let reportNode
  let fiatBalancesAtom
  beforeEach(() => {
    fiatBalancesAtom = createFiatBalancesAtom()

    reportNode = createFiatBalancesReportReport({ fiatBalancesAtom })
  })

  it('should have correct namespace', () => {
    expect(reportNode.namespace).toEqual('fiatBalances')
  })

  it('should create proper report', async () => {
    await fiatBalancesAtom.set({
      balances: {
        byWalletAccount: {
          exodus_0: {
            balance: createFiatNumberUnit(50),
          },
          exodus_1: {
            balance: createFiatNumberUnit(20),
          },
        },
      },
    })
    const report = await reportNode.export()

    const expectedReport = {
      exodus_0: '50 USD',
      exodus_1: '20 USD',
    }

    expect(report).toEqual(expectedReport)
  })
})
