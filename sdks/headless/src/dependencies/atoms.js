import baseAssetNamesToMonitorAtomDefinition from '../atoms/base-asset-names-to-monitor.js'

const createAtomDependencies = ({ config }) => [
  {
    definition: baseAssetNamesToMonitorAtomDefinition,
    config: { ignoreAssetNames: config.ignoreAssetNamesToMonitor },
  },
]

export default createAtomDependencies
