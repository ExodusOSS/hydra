interface SyncTimeConfig {
  interval?: number
}

declare const syncTime: (config?: SyncTimeConfig) => {
  id: 'syncTime'
  definitions: []
}

export default syncTime
