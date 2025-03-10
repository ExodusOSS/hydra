const getUnavailableStatus = (featureConfig) =>
  featureConfig?.unavailableStatus || featureConfig?.error

export default getUnavailableStatus
