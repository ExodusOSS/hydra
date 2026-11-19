import type { Atom } from '@exodus/atoms'

import { TELEMETRY_OPT_OUT_COUNTRIES } from '../constants.js'

type Atoms = {
  geolocationAtom: Atom<{ countryCode: string }>
  shareActivityAtom: Atom<boolean>
}

type Params = {
  atoms: Atoms
}

const createOptInAnalyticsMigration = async (params: Params): Promise<void> => {
  const { geolocationAtom, shareActivityAtom } = params.atoms
  const { countryCode } = await geolocationAtom.get()

  const isOptOutCountry = TELEMETRY_OPT_OUT_COUNTRIES.has(countryCode)

  if (!isOptOutCountry) {
    void shareActivityAtom.set(true)
  }
}

const optInAnalyticsMigration = {
  name: 'opt-in-migration',
  factory: createOptInAnalyticsMigration,
} as const

export default optInAnalyticsMigration
