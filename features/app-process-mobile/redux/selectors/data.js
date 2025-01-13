import { MY_STATE } from '@exodus/redux-dependency-injection'

const dataSelector = {
  id: 'data',
  resultFunction: (state) => state,
  dependencies: [{ selector: MY_STATE }],
}

export default dataSelector
