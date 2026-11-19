import type { UnitType } from '@exodus/currency'

declare const currencyUnitTypeDefinition: {
  id: 'currencyUnitType'
  resultFunction: (currency: string) => UnitType
  dependencies: [{ selector: 'currency' }]
}

export default currencyUnitTypeDefinition
