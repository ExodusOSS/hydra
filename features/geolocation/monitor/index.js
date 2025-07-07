import createGeolocationMonitor from './geolocation.js'

const geolocationMonitorDefinition = {
  id: 'geolocationMonitor',
  type: 'monitor',
  factory: createGeolocationMonitor,
  dependencies: ['geolocationAtom', 'config', 'logger', 'getBuildMetadata', 'fetch'],
  public: true,
}

export { MODULE_ID } from './geolocation.js'

export default geolocationMonitorDefinition
