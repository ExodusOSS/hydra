import { SafeError } from '@exodus/errors'
import { safeString } from '@exodus/safe-string'
// oxlint-disable-next-line no-restricted-imports -- basic-utils has no cloneDeepWith equivalent
import cloneDeepWith from 'lodash/cloneDeepWith.js'

import { rejectAfter } from '../utils/promises.js'
import { deepAlphabetize } from '../utils/deep-alphabetize.js'
import safeParse from './safe-parse.js'

const reportCustomizer = (value) => {
  if (value instanceof Error) {
    return SafeError.from(value)
  }

  // Lodash issue: https://github.com/lodash/lodash/issues/5247
  // Skip cloning objects with custom toJSON - cloning can lose private fields needed for serialization.
  // Cloning is only needed for Error coercion above.
  if (typeof value?.toJSON === 'function') {
    return value
  }
}

const createReporting = ({ ioc, config: { exportTimeout = 5000 } = {} }) => {
  const logger = ioc.get('createLogger')('reporting')
  const nodes = ioc.getByType('report')

  const { wallet, lockedAtom } = ioc.getAll()

  const getReports = async () => {
    const [existsOutcome, lockedOutcome] = await Promise.allSettled([
      wallet.exists(),
      lockedAtom.get(),
    ])
    const exists = existsOutcome.status === 'fulfilled' ? existsOutcome.value : null
    const locked = lockedOutcome.status === 'fulfilled' ? lockedOutcome.value : null
    const errors = {}
    if (existsOutcome.status === 'rejected') {
      errors.walletExists = SafeError.from(existsOutcome.reason)
    }

    if (lockedOutcome.status === 'rejected') {
      errors.isLocked = SafeError.from(lockedOutcome.reason)
    }

    const reports = Object.values(nodes)

    const timeoutPromise = rejectAfter(
      exportTimeout,
      safeString`Export took longer than the maximum export timeout of ${Math.ceil(exportTimeout / 1000)}s`
    )

    const exportReport = async (report) => {
      const start = performance.now()
      const unvalidatedExport = await report.export({
        walletExists: exists,
        // Keep protected reports gated when the lock state is unknown.
        isLocked: locked ?? true,
      })
      const schema = report.getSchema?.()
      if (!schema) {
        throw new Error(`Validation schema is missing for ${report.namespace}.`)
      }

      const validatedExport = safeParse(schema, cloneDeepWith(unvalidatedExport, reportCustomizer))
      const duration = performance.now() - start
      logger.debug(`Exported report for ${report.namespace} in ${duration}ms`)
      return validatedExport
    }

    const resolvedReports = await Promise.allSettled(
      reports.map((report) => Promise.race([exportReport(report), timeoutPromise.promise]))
    )

    timeoutPromise.clear()

    const result = Object.fromEntries(
      resolvedReports.map((outcome, index) => [
        reports[index].namespace,
        outcome.status === 'fulfilled' ? outcome.value : { error: SafeError.from(outcome.reason) },
      ])
    )
    if (Object.keys(errors).length > 0) {
      result.reporting = { walletExists: exists, isLocked: locked, errors }
    }

    return deepAlphabetize(result)
  }

  return { export: getReports }
}

export default createReporting
