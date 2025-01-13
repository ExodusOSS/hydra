// see initialState.data
const resultFunction = (data) => Object.keys(data)

const namesSelector = {
  id: 'names',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default namesSelector
