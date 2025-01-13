import { createFusionAtom } from '@exodus/fusion-atoms'
import type { Logger } from '@exodus/logger'

type Params = {
  fusion: unknown
  logger: Logger
}

export const createWalletCreatedAtAtom = ({ fusion, logger }: Params) =>
  createFusionAtom({ fusion, logger, path: 'createdAt', defaultValue: new Date().toISOString() })
