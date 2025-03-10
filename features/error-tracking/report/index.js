import { SafeError } from '@exodus/errors'

const errorTrackingReportDefinition = {
  type: 'report',
  id: 'errorTrackingReport',
  factory: ({ errorsAtom }) => ({
    namespace: 'errors',
    export: async () => {
      const { errors } = await errorsAtom.get()
      return {
        errors: errors.map(({ namespace, error, context, time }) => ({
          namespace,
          error: SafeError.from(error),
          time,
        })),
      }
    },
  }),
  dependencies: ['errorsAtom'],
  public: true,
}

export default errorTrackingReportDefinition
