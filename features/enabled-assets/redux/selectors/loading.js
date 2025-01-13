// see initialState.loaded
const resultFunction = (loaded) => !loaded

const loadingSelector = {
  id: 'loading',
  resultFunction,
  dependencies: [
    //
    { selector: 'loaded' },
  ],
}

export default loadingSelector
