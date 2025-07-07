declare const geolocationDebugDefinition: {
  id: string
  type: string
  factory(): {
    geolocation: {
      merge: (params: {
        countryCode: string
        countryName: string
        ip: string
        isAllowed: boolean
        regionCode: string
        regionName: string
        timezoneName: string
      }) => Promise<void>
    }
  }
}

export default geolocationDebugDefinition
