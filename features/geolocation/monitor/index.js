import createGeolocationMonitor from './geolocation'

const geolocationMonitorDefinition = {
  id: 'geolocationMonitor',
  type: 'monitor',
  factory: createGeolocationMonitor,
  dependencies: ['geolocationAtom', 'config', 'logger', 'getBuildMetadata', 'fetch'],
  public: true,
}

export { MODULE_ID } from './geolocation'

export default geolocationMonitorDefinition
