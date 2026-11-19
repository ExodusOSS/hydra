import type txLogMonitorsApiDefinition from './api/index.js'

export type { TxLogMonitors, TxLogMonitorUpdateParams } from './module/tx-log-monitors.d.ts'

declare const txLogMonitors: (config?: Record<string, unknown>) => {
  id: 'txLogMonitorsFeature'
  definitions: [{ definition: typeof txLogMonitorsApiDefinition }]
}

export default txLogMonitors
