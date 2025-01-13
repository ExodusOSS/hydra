import type txLogMonitorsApiDefinition from './api/index.js'

declare const txLogMonitors: () => {
  id: 'txLogMonitors'
  definitions: [{ definition: typeof txLogMonitorsApiDefinition }]
}

export default txLogMonitors
