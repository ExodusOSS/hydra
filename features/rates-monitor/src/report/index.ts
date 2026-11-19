import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

import type { RatesByCurrency } from '../redux/types.js'

const createRatesReport = ({ ratesAtom }: { ratesAtom: Atom<RatesByCurrency> }) => ({
  namespace: 'rates',
  export: async (_opts?: Record<string, unknown>) => {
    const rates = await ratesAtom.get()
    const firstCurrencyKey = Object.keys(rates)[0]
    return firstCurrencyKey ? Object.keys(rates[firstCurrencyKey]!) : []
  },
})

const ratesReportDefinition = {
  id: 'ratesReport',
  type: 'report',
  factory: createRatesReport,
  dependencies: ['ratesAtom'],
  public: true,
} as const satisfies Definition

export default ratesReportDefinition
