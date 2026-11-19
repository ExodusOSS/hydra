import { createFusionAtom } from '@exodus/fusion-atoms'
import type { Logger } from '@exodus/logger'

type Params = {
  fusion: unknown
  logger: Logger
}

// set by fusion backend https://github.com/ExodusMovement/e2ee-firebase-functions/blob/6a2ccaeeb7893e6bf3e85cdcc75b2fb90282d7cc/functions/src/routes/auth.js#L96
export const createWalletCreatedAtAtom = ({ fusion, logger }: Params) =>
  createFusionAtom({
    fusion,
    logger,
    path: 'createdAt',
    defaultValue: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  })
