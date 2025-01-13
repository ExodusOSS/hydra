import { createRemoteConfigAtomFactory } from '@exodus/remote-config-atoms'

const createPricingServerUrlAtom = ({ config, remoteConfig }) =>
  createRemoteConfigAtomFactory({ remoteConfig })({
    path: config.pricingServerPath,
    defaultValue: config.defaultPricingServerUrl,
  })

export default createPricingServerUrlAtom
