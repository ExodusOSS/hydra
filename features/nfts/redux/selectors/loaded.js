const resultFunction = (nfts) => nfts.loaded

const loadedSelectorDefinition = {
  id: 'loaded',
  resultFunction,
  dependencies: [
    //
    { selector: 'nfts' },
  ],
}

export default loadedSelectorDefinition
