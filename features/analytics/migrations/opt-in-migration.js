import { TELEMETRY_OPT_OUT_COUNTRIES } from '../constants.js'

const createOptInAnalyticsMigration = async ({ atoms }) => {
  const { geolocationAtom, shareActivityAtom } = atoms
  const { countryCode } = await geolocationAtom.get()

  const isOptOutCountry = TELEMETRY_OPT_OUT_COUNTRIES.has(countryCode)

  if (!isOptOutCountry) {
    shareActivityAtom.set(true)
  }
}

const optInAnalyticsMigration = {
  name: 'opt-in-migration',
  factory: createOptInAnalyticsMigration,
}

export default optInAnalyticsMigration
