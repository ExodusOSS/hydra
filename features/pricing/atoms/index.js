import createPricingServerUrlAtom from './pricing-server-url.js'

export const pricingServerUrlAtomDefinition = {
  id: 'pricingServerUrlAtom',
  type: 'atom',
  factory: createPricingServerUrlAtom,
  dependencies: ['config', 'remoteConfig'],
  public: true,
}
