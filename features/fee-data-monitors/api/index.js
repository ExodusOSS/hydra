const createFeesApi = ({ feeMonitors }) => ({
  fees: {
    getFeeData: feeMonitors.getFeeData,
  },
})

const feesApiDefinition = {
  id: 'feesApi',
  type: 'api',
  factory: createFeesApi,
  dependencies: ['feeMonitors'],
}

export default feesApiDefinition
