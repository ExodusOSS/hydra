const resultFunction = (active, isCustodial) => isCustodial(active)

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'activeIsCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isCustodial' },
  ],
}
