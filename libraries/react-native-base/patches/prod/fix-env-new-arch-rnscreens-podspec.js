#!/usr/bin/env node

const path = require('path')

const applyPatch = require('../apply-patch')
const { reactNativeVersion, directories } = require('../../utils/context')

const changes = [
  {
    file: path.join(
      directories.nodeModules.prod.absolute,
      '@exodus/react-native-screens/RNScreens.podspec'
    ),
    before: `ENV['RCT_NEW_ARCH_ENABLED']`,
    after: `false`,
  },
]

const fixPodspecs = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken podspecs fix')

  console.log('# Fixing podspecs')
  changes.forEach(({ before, after, file }) => {
    applyPatch(file, before, after)
  })
}

fixPodspecs()
