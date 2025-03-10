const isEnabledInGeolocation = (featureConfig, { geolocation }) => {
  // if there is no geolocation config default to allowing
  if (!featureConfig?.geolocation) return true
  // default to not allowing in case there is a mis-configuration
  if (typeof featureConfig.geolocation !== 'object' || Array.isArray(featureConfig.geolocation))
    return false

  const geolocationConfig = featureConfig?.geolocation || {}

  const countryCode = geolocation.countryCode

  // Get the list of blacklisted regions. If `none`, it would be available for all regions.
  if (countryCode) {
    const { disabledRegions = Object.create(null) } = geolocationConfig
    const disabledRegionsForCountry = disabledRegions[countryCode] || {}
    const regionCodes = Object.keys(disabledRegionsForCountry)
    const regionNames = Object.values(disabledRegionsForCountry)
    const offForRegion =
      regionCodes.includes(geolocation.regionCode) || regionNames.includes(geolocation.region)
    if (offForRegion) return false
  }

  // Get the list of blacklisted countries.
  const { disabledCountries = Object.create(null) } = geolocationConfig
  const disabledCountryCodes = Object.keys(disabledCountries)
  const disabledCountryNames = Object.values(disabledCountries)
  const disabledForCountry =
    disabledCountryCodes.includes(geolocation.countryCode) ||
    disabledCountryNames.includes(geolocation.country)
  if (disabledForCountry) {
    return false
  }

  // If the list of whitelisted countries is 'all', it would be available everywhere.
  const { countries = Object.create(null) } = geolocationConfig
  const onForAllCountries = countries === 'all'
  if (onForAllCountries) return true

  // Check if the device country is in the list of whitelisted countries.
  const countryCodes = Object.keys(countries)
  const countryNames = Object.values(countries)
  return countryCodes.includes(countryCode) || countryNames.includes(geolocation.country)
}

export default isEnabledInGeolocation
