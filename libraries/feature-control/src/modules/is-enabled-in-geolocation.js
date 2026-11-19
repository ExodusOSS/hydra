const isEnabledInGeolocation = (featureConfig, { geolocation }) => {
  // if there is no geolocation config default to allowing
  if (!featureConfig?.geolocation) return true
  // default to not allowing in case there is a mis-configuration
  if (typeof featureConfig.geolocation !== 'object' || Array.isArray(featureConfig.geolocation)) {
    return false
  }

  const geolocationConfig = featureConfig?.geolocation || {}

  const countryCode = geolocation.countryCode
  const countryName = geolocation.countryName ?? geolocation.country
  const regionCode = geolocation.regionCode
  const regionName = geolocation.regionName ?? geolocation.region
  const regionCity = geolocation.regionCity
  const regionCandidates = [regionCode, regionName, regionCity].filter(Boolean)

  // Get the list of blacklisted regions. If `none`, it would be available for all regions.
  if (countryCode) {
    const { disabledRegions = Object.create(null) } = geolocationConfig
    const disabledRegionsForCountry = disabledRegions[countryCode] || {}
    const regionCodes = Object.keys(disabledRegionsForCountry)
    const regionNames = Object.values(disabledRegionsForCountry)
    const offForRegion = regionCandidates.some(
      (candidate) => regionCodes.includes(candidate) || regionNames.includes(candidate)
    )
    if (offForRegion) return false
  }

  // Get the list of blacklisted countries.
  const { disabledCountries = Object.create(null) } = geolocationConfig
  const disabledCountryCodes = Object.keys(disabledCountries)
  const disabledCountryNames = Object.values(disabledCountries)
  const disabledForCountry =
    disabledCountryCodes.includes(countryCode) || disabledCountryNames.includes(countryName)
  if (disabledForCountry) {
    return false
  }

  const enabledRegionsConfig = geolocationConfig.enabledRegions
  const hasEnabledRegionsConfig =
    enabledRegionsConfig !== undefined &&
    enabledRegionsConfig !== null &&
    enabledRegionsConfig !== 'all'

  if (hasEnabledRegionsConfig) {
    if (typeof enabledRegionsConfig !== 'object' || Array.isArray(enabledRegionsConfig)) {
      return false
    }

    if (!countryCode) return false

    if (Object.prototype.hasOwnProperty.call(enabledRegionsConfig, countryCode)) {
      const enabledRegionsForCountry = enabledRegionsConfig[countryCode]
      // Country is keyed; value must be a plain region map. Fail closed on mis-config.
      if (
        enabledRegionsForCountry === null ||
        typeof enabledRegionsForCountry !== 'object' ||
        Array.isArray(enabledRegionsForCountry)
      ) {
        return false
      }

      const enabledRegionCodes = Object.keys(enabledRegionsForCountry)
      const enabledRegionNames = Object.values(enabledRegionsForCountry)

      const isEnabledInRegion = regionCandidates.some(
        (candidate) =>
          enabledRegionCodes.includes(candidate) || enabledRegionNames.includes(candidate)
      )
      if (!isEnabledInRegion) {
        return false
      }
    }
  }

  // If the list of whitelisted countries is 'all', it would be available everywhere.
  const { countries = Object.create(null) } = geolocationConfig
  const onForAllCountries = countries === 'all'
  if (onForAllCountries) return true

  // Check if the device country is in the list of whitelisted countries.
  const countryCodes = Object.keys(countries)
  const countryNames = Object.values(countries)
  return countryCodes.includes(countryCode) || countryNames.includes(countryName)
}

export default isEnabledInGeolocation
