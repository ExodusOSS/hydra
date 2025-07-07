import { createAtomMock } from '@exodus/atoms'

import { enabledAssetsAtomDefinition } from '../../atoms/index.js'
import enabledAssetsReportDefinition from '../index.js'

const { factory: createEnabledAssetsAtom } = enabledAssetsAtomDefinition
const { factory: createEnabledAssetsReport } = enabledAssetsReportDefinition

describe('enabledAssetsReport', () => {
  let reportNode
  beforeEach(() => {
    const enabledAndDisabledAssetsAtom = createAtomMock({
      defaultValue: {
        disabled: {
          asset3: true,
          asset2: false,
          asset1: false,
        },
      },
    })
    const availableAssetNamesAtom = createAtomMock({
      defaultValue: ['asset1', 'asset2', 'asset3', 'asset4'],
    })
    const enabledAssetsAtom = createEnabledAssetsAtom({
      enabledAndDisabledAssetsAtom,
      availableAssetNamesAtom,
    })

    reportNode = createEnabledAssetsReport({ enabledAssetsAtom })
  })

  it('should have correct namespace', () => {
    expect(reportNode.namespace).toEqual('enabledAssets')
  })

  it('should gracefully handle when a wallet does not exist or locked', async () => {
    expect(reportNode.getSchema().parse(await reportNode.export({ walletExists: false }))).toEqual(
      null
    )
    expect(
      reportNode.getSchema().parse(await reportNode.export({ walletExists: true, isLocked: true }))
    ).toEqual(null)
  })

  it('should create proper report', async () => {
    const report = reportNode.getSchema().parse(await reportNode.export({ walletExists: true }))
    expect(report).toEqual(['asset1', 'asset2'])
  })
})
