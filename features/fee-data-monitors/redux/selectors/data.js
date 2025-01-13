import { MY_STATE } from '@exodus/redux-dependency-injection'

const resultFunction = (feeData) => feeData

const dataSelectorDefinition = {
  id: 'data',
  resultFunction,
  dependencies: [{ selector: MY_STATE }],
}

export default dataSelectorDefinition
