const errorTrackingReportDefinition = {
  type: 'report',
  id: 'errorTrackingReport',
  factory: ({ errorsAtom }) => ({
    namespace: 'errorTracking',
    export: async () => {
      return errorsAtom.get()
    },
  }),
  dependencies: ['errorsAtom'],
  public: true,
}

export default errorTrackingReportDefinition
