import { createFusionAtom } from '@exodus/fusion-atoms'

const createMultipleWalletAccountsEnabledAtom = ({ fusion, logger }) =>
  createFusionAtom({
    fusion,
    logger,
    path: 'multipleWalletAccountsEnabled',
    defaultValue: undefined,
  })

export default createMultipleWalletAccountsEnabledAtom
