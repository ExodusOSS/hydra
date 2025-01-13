const shouldAuthenticateSelectorDefinition = {
  id: 'shouldAuthenticate',
  resultFunction: (hasPin, hasBioAuth) => hasPin || hasBioAuth,
  dependencies: [{ selector: 'hasPin' }, { selector: 'hasBioAuth' }],
}

const selectorDefinitions = [shouldAuthenticateSelectorDefinition]

export default selectorDefinitions
