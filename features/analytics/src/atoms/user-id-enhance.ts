import { enforceObservableRules, withStorageCache } from '@exodus/atoms'
import type { Atom, Logger } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'

type Params = {
  atom: Atom<string>
  storage: Storage<string>
  logger: Logger
}

const createUserIdEnhance =
  (key: string) =>
  ({ atom, storage, logger }: Params) => {
    const withRules = enforceObservableRules<string>({
      ...atom,
      makeGetNonConcurrent: true,
    })

    return withStorageCache<string>({
      atom: withRules,
      storage,
      key,
      logger,
    })
  }

export default createUserIdEnhance
