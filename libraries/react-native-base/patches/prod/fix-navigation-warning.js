#!/usr/bin/env node

const path = require('path')
const applyPatch = require('../apply-patch')
const { reactNavigationCoreVersion, directories } = require('../../utils/context')

const before = `            if (!serializableWarnings.includes(message)) {
              serializableWarnings.push(message);
              console.warn(message);
            }`

const after = `            if (!serializableWarnings.includes(message)) {
              serializableWarnings.push(message);
            }`

const fixReactNavigationWarning = () => {
  if (reactNavigationCoreVersion !== '6.2.1-exodus.0') throw new Error('broken navigation fix')

  console.log('# Fixing react-navigation warning')
  applyPatch(
    path.join(
      directories.nodeModules.prod.absolute,
      '@react-navigation/core/src/BaseNavigationContainer.tsx'
    ),
    before,
    after
  )
}

fixReactNavigationWarning()
