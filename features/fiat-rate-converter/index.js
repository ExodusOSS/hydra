import fiatRateConverterDefinition from './module/index.js'
import typeforce from '@exodus/typeforce'

const DEFAULT_CURRENCY = 'USD'

const fiatRateConverter = ({ defaultCurrency = DEFAULT_CURRENCY } = Object.create(null)) => {
  const config = {
    defaultCurrency,
  }
  typeforce(
    {
      defaultCurrency: '?String',
    },
    config,
    true
  )

  return {
    id: 'fiatRateConverter',
    definitions: [
      {
        definition: fiatRateConverterDefinition,
        config,
      },
    ],
  }
}

export default fiatRateConverter
