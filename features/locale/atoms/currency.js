import { createFusionAtom } from '@exodus/fusion-atoms'
import { optimisticNotifier } from '@exodus/atoms'

const createCurrencyAtom = ({ fusion, config }) =>
  optimisticNotifier(
    createFusionAtom({
      fusion,
      path: 'private.currency',
      defaultValue: config.defaultValue,
    })
  )

export default createCurrencyAtom
