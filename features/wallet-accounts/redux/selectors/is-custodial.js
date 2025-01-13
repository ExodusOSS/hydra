const resultFunction = (get) => (name) => get(name)?.isCustodial ?? false

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'isCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
}
