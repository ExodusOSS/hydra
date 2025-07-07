import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

const createAppProcessReport = ({ appProcessAtom, appStateHistoryAtom }) => ({
  namespace: 'appProcess',
  export: async () => {
    const [history, appProcess] = await Promise.all([
      appStateHistoryAtom.get(),
      appProcessAtom.get(),
    ])

    return {
      history: history.map((entry) => ({ ...entry, timestamp: entry.timestamp.toISOString() })),
      startTime: new Date(appProcess.startTime).toISOString(),
    }
  },
  getSchema: memoize(() => {
    const mode = z.enum(['active', 'background', 'inactive', 'unknown', 'extension', 'end'])

    const appStates = z.array(
      z
        .object({
          from: mode,
          to: mode,
          timestamp: z.string(),
          timeInBackground: z.number().nonnegative(),
          timeLastBackgrounded: z.number().nonnegative(),
        })
        .strict()
    )

    return z.object({ history: appStates, startTime: z.string() }).strict()
  }),
})

const appProcessReportDefinition = {
  id: 'appProcessReport',
  type: 'report',
  factory: createAppProcessReport,
  dependencies: ['appStateHistoryAtom', 'appProcessAtom'],
  public: true,
}

export default appProcessReportDefinition
