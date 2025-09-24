import isActiveSelector from './is-active.js'
import isBackgroundSelector from './is-background.js'
import isOfflineSelector from './is-offline.js'
import dataSelector from './data.js'
import lockActivatesAtSelector from './lock-activates-at.js'

export default [
  isOfflineSelector,
  dataSelector,
  isBackgroundSelector,
  isActiveSelector,
  lockActivatesAtSelector,
]
