import { SafeError } from '@exodus/errors'
import { zipObject } from 'lodash'

import { rejectAfter } from '../utils/promises'

const createReporting = ({ ioc, config: { exportTimeout = 5000 } }) => {
  const logger = ioc.get('createLogger')('reporting')
  const nodes = ioc.getByType('report')

  const { wallet, lockedAtom } = ioc.getAll()

  const getReports = async () => {
    const [exists, locked] = await Promise.all([wallet.exists(), lockedAtom.get()])
    if (exists && locked) {
      throw new Error('Unable to export when locked')
    }

    const reports = Object.values(nodes)

    const timeoutPromise = rejectAfter(
      exportTimeout,
      `Export took longer than the maximum export timeout of ${Math.ceil(exportTimeout / 1000)}s`
    )

    const exportReport = async (report) => {
      const start = performance.now()
      const result = await report.export({ walletExists: exists })
      const duration = performance.now() - start
      logger.debug(`Exported report for ${report.namespace} in ${duration}ms`)
      return result
    }

    const resolvedReports = await Promise.allSettled(
      reports.map((report) => Promise.race([exportReport(report), timeoutPromise]))
    )

    const namespaces = reports.map((report) => report.namespace)
    const data = resolvedReports.map((outcome) =>
      outcome.status === 'fulfilled' ? outcome.value : { error: SafeError.from(outcome.reason) }
    )

    return zipObject(namespaces, data)
  }

  return { export: getReports }
}

export default createReporting
