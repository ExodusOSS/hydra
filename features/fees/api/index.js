const createFeesApi = ({ fees }) => ({ fees })

const feesApiDefinition = {
  id: 'feesModuleApi',
  type: 'api',
  factory: createFeesApi,
  dependencies: ['fees'],
}

export default feesApiDefinition
