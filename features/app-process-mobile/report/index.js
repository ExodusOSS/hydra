const createAppProcessReport = ({ appStateHistoryAtom }) => ({
  namespace: 'appProcess',
  export: async () => {
    const history = await appStateHistoryAtom.get()
    return {
      history: history.map((entry) => ({ ...entry, timestamp: entry.timestamp.toISOString() })),
    }
  },
})

const appProcessReportDefinition = {
  id: 'appProcessReport',
  type: 'report',
  factory: createAppProcessReport,
  dependencies: ['appStateHistoryAtom'],
  public: true,
}

export default appProcessReportDefinition
