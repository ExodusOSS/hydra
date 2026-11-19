import createInMemoryStorage from '@exodus/storage-memory'

import { restoringAssetsAtomDefinition } from '../../atoms/index.js'
import restoringAssetsReportDefinition from '../index.js'

describe('restoringAssetsReport', () => {
  it('should gracefully handle when a wallet does not exist or locked', async () => {
    const storage = createInMemoryStorage()
    const restoringAssetsAtom = restoringAssetsAtomDefinition.factory({ storage })

    const data = {
      bitcoin: true,
      ethereum: true,
    }
    await restoringAssetsAtom.set(data)
    const reportNode = restoringAssetsReportDefinition.factory({ restoringAssetsAtom })

    expect(reportNode.getSchema().parse(await reportNode.export({ walletExists: false }))).toEqual(
      null
    )
    expect(
      reportNode.getSchema().parse(await reportNode.export({ walletExists: true, isLocked: true }))
    ).toEqual(null)
  })

  it('should return restoringAssetsAtom state in proper structure', async () => {
    const storage = createInMemoryStorage()
    const restoringAssetsAtom = restoringAssetsAtomDefinition.factory({ storage })

    const data = {
      bitcoin: true,
      ethereum: true,
    }
    await restoringAssetsAtom.set(data)
    const reportNode = restoringAssetsReportDefinition.factory({ restoringAssetsAtom })

    const report = reportNode.getSchema().parse(await reportNode.export({ walletExists: true }))

    expect(reportNode.namespace).toBe('restoringAssets')
    expect(report.data).toEqual(['bitcoin', 'ethereum'])
  })
})
