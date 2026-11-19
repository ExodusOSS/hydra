import type { TxLogMonitors } from '../module/tx-log-monitors.d.ts'

declare const txLogMonitorsApiDefinition: {
  id: 'txLogMonitorsApi'
  type: 'api'
  factory(): {
    txLogMonitors: Pick<TxLogMonitors, 'update'>
  }
}

export default txLogMonitorsApiDefinition
