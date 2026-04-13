const shouldAuthenticateSelectorDefinition = {
  id: 'shouldAuthenticate',
  resultFunction: (hasDeviceAuth, hasPin, hasBioAuth) => hasDeviceAuth || hasPin || hasBioAuth,
  dependencies: [{ selector: 'hasDeviceAuth' }, { selector: 'hasPin' }, { selector: 'hasBioAuth' }],
}

const selectorDefinitions = [shouldAuthenticateSelectorDefinition]

export default selectorDefinitions
