import type geolocationDebugDefinition from './debug/index.js'

declare const geolocation: () => {
  id: 'geolocation'
  definitions: [{ definition: typeof geolocationDebugDefinition }]
}

export default geolocation
