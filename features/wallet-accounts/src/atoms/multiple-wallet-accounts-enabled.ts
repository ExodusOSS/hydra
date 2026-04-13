import { createFusionAtom } from '@exodus/fusion-atoms'
import type { Logger } from '@exodus/atoms'
import type { Fusion } from '../types.js'

const createMultipleWalletAccountsEnabledAtom = ({
  fusion,
  logger,
}: {
  fusion: Fusion
  logger: Logger
}) =>
  createFusionAtom({
    fusion,
    logger,
    path: 'multipleWalletAccountsEnabled',
    defaultValue: undefined,
    online: undefined,
  })

export default createMultipleWalletAccountsEnabledAtom
