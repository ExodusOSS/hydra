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
          asset1: false,
          asset2: false,
          asset3: true,
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

  it('should create proper report', async () => {
    const report = await reportNode.export()

    const expectedReport = {
      asset1: true,
      asset2: true,
    }

    expect(report).toEqual(expectedReport)
  })
})
