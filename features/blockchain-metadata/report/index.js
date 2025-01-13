const createblockchainMetadataReport = ({ txLogsAtom, accountStatesAtom }) => ({
  namespace: 'blockchainMetadata',
  export: async () => {
    const [txLogs, accountStates] = await Promise.all([txLogsAtom.get(), accountStatesAtom.get()])
    return {
      txLogs,
      accountStates,
    }
  },
})

const blockchainMetadataReportDefinition = {
  id: 'blockchainMetadataReport',
  type: 'report',
  factory: createblockchainMetadataReport,
  dependencies: ['txLogsAtom', 'accountStatesAtom'],
  public: true,
}

export default blockchainMetadataReportDefinition
