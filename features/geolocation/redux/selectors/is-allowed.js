const resultFunction = (data) => data.isAllowed

const isAllowedSelectorDefinition = {
  id: 'isAllowed',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default isAllowedSelectorDefinition
