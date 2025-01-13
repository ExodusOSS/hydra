const createTxLogMonitorsApi = ({ txLogMonitors }) => ({
  txLogMonitors: {
    update: txLogMonitors.update,
    // @deprecated
    refreshMonitor: txLogMonitors.refreshMonitor,
  },
})

const txLogMonitorsApiDefinition = {
  id: 'txLogMonitorsApi',
  type: 'api',
  factory: createTxLogMonitorsApi,
  dependencies: ['txLogMonitors'],
}

export default txLogMonitorsApiDefinition
