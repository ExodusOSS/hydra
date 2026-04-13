import { SafeError, SafeContext } from '@exodus/errors'
import { memoize } from '@exodus/basic-utils'
import { z } from '@exodus/zod'

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
          context,
        })),
      }
    },
    getSchema: memoize(() =>
      z
        .object({
          errors: z.array(
            z
              .object({
                namespace: z.string(),
                error: z.instanceof(SafeError),
                time: z.number(),
                context: SafeContext.getSchema(),
              })
              .strict()
          ),
        })
        .strict()
    ),
  }),
  dependencies: ['errorsAtom'],
  public: true,
}

export default errorTrackingReportDefinition
