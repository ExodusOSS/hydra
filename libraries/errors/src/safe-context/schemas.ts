import { z } from '@exodus/zod'
import { isSafe } from '@exodus/safe-string'
import { memoize } from '@exodus/basic-utils'
import { TraceId } from '@exodus/traceparent'

const createContextSchema = () =>
  z
    .object({
      navigation: z
        .object({
          currentRouteName: z.string().refine(isSafe),
          previousRouteName: z.string().refine(isSafe).nullish(),
        })
        .strict()
        .nullish(),
      traceId: z.custom<TraceId>((val) => val instanceof TraceId).nullish(),
      reason: z.string().refine(isSafe).nullish(),
      type: z.string().refine(isSafe).nullish(),
      baseAssetName: z.string().refine(isSafe).nullish(),
      exchange: z
        .object({
          events: z.array(z.string().refine(isSafe)).nullish(),
        })
        .strict()
        .nullish(),
    })
    .strict()
    .nullish()

// Memoize the factory for lazy loading.
const getContextSchema = memoize(createContextSchema) as () => ReturnType<
  typeof createContextSchema
>

// Infer type from the factory's return type.
export type SafeContextType = z.infer<ReturnType<typeof createContextSchema>>

export { getContextSchema }
