import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'

const resultFunction = (active: string, isCustodial: (name: string) => boolean): boolean =>
  isCustodial(active)

export default defineSelectorResultFunction({
  id: 'activeIsCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isCustodial' },
  ],
})
