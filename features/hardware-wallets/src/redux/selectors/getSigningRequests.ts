import { MY_STATE } from '@exodus/redux-dependency-injection'
import type { HardwareWalletsState } from '../initial-state.js'

const resultFunction = (self: HardwareWalletsState) => self.signingRequests

const assetDataSelectorDefinition = {
  id: 'getSigningRequests',
  resultFunction,
  dependencies: [{ selector: MY_STATE }],
} as const

export default assetDataSelectorDefinition
