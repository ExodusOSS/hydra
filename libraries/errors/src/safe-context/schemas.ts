import { z } from '@exodus/zod'
import { isSafe } from '@exodus/safe-string'
import { memoize } from '@exodus/basic-utils'

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
      traceId: z.string().refine(isSafe).nullish(),
    })
    .strict()
    .nullish()

// Memoize the factory for lazy loading.
const getContextSchema = <() => ReturnType<typeof createContextSchema>>memoize(createContextSchema)

// Infer type from the factory's return type.
export type SafeContextType = z.infer<ReturnType<typeof createContextSchema>>

export { getContextSchema }
