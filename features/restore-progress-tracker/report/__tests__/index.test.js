import createInMemoryStorage from '@exodus/storage-memory'

import { restoringAssetsAtomDefinition } from '../../atoms'
import restoringAssetsReportDefinition from '..'

describe('restoringAssetsReport', () => {
  it('should return restoringAssetsAtom state in proper structure', async () => {
    const storage = createInMemoryStorage()
    const restoringAssetsAtom = restoringAssetsAtomDefinition.factory({ storage })

    const data = {
      bitcoin: true,
      ethereum: true,
    }
    await restoringAssetsAtom.set(data)
    const reportNode = restoringAssetsReportDefinition.factory({ restoringAssetsAtom })

    const report = await reportNode.export()

    expect(reportNode.namespace).toBe('restoringAssets')
    expect(report.data).toEqual(['bitcoin', 'ethereum'])
  })
})
