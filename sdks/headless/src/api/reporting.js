import { SafeError } from '@exodus/errors'
import lodash from 'lodash'

import { rejectAfter } from '../utils/promises.js'
import { deepAlphabetize } from '../utils/deep-alphabetize.js'
import safeParse from './safe-parse.js'

const { cloneDeepWith, zipObject } = lodash

const reportCustomizer = (value) => {
  if (value instanceof Error) {
    return SafeError.from(value)
  }

  // Lodash issue: https://github.com/lodash/lodash/issues/5247
  // Avoid cloning SafeError instances to prevent losing private class fields, which are used during JSON serialization.
  if (value instanceof SafeError) {
    return value
  }
}

const createReporting = ({ ioc, config: { exportTimeout = 5000 } = {} }) => {
  const logger = ioc.get('createLogger')('reporting')
  const nodes = ioc.getByType('report')

  const { wallet, lockedAtom } = ioc.getAll()

  const getReports = async () => {
    const [exists, locked] = await Promise.all([wallet.exists(), lockedAtom.get()])

    const reports = Object.values(nodes)

    const timeoutPromise = rejectAfter(
      exportTimeout,
      `Export took longer than the maximum export timeout of ${Math.ceil(exportTimeout / 1000)}s`
    )

    const exportReport = async (report) => {
      const start = performance.now()
      const unvalidatedExport = await report.export({ walletExists: exists, isLocked: locked })
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

    const namespaces = reports.map((report) => report.namespace)
    const data = resolvedReports.map((outcome) =>
      outcome.status === 'fulfilled' ? outcome.value : { error: SafeError.from(outcome.reason) }
    )

    return deepAlphabetize(zipObject(namespaces, data))
  }

  return { export: getReports }
}

export default createReporting
