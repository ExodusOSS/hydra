import { enforceObservableRules, withStorageCache } from '@exodus/atoms'

const createUserIdEnhance =
  (key) =>
  ({ atom, storage, logger }) => {
    const withRules = enforceObservableRules({
      ...atom,
      makeGetNonConcurrent: true,
    })

    return withStorageCache({
      atom: withRules,
      storage,
      key,
      logger,
    })
  }

export default createUserIdEnhance
