const createAnalyticsReport = ({ analyticsUserIdAtom }) => ({
  namespace: 'analytics',
  export: async ({ walletExists } = Object.create(null)) => {
    return {
      userId: walletExists ? await analyticsUserIdAtom.get() : null,
    }
  },
})

const analyticsReportDefinition = {
  id: 'analyticsReport',
  type: 'report',
  factory: createAnalyticsReport,
  dependencies: ['analyticsUserIdAtom'],
  public: true,
}

export default analyticsReportDefinition
