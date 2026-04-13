const resultFunction = (active: string, isCustodial: (name: string) => boolean) =>
  isCustodial(active)

export default {
  id: 'activeIsCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isCustodial' },
  ],
} as const
