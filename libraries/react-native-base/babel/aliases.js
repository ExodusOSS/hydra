const { directories } = require('../utils/context')

module.exports = {
  fs: `./${directories.prod.relative}/_local_modules/you-shall-not-pass/object`,
  path: `./${directories.prod.relative}/_local_modules/you-shall-not-pass/object`,
  '~/png': `./${directories.prod.relative}/assets/png`,
  '~/svg': `./${directories.prod.relative}/components/svg`,
  '~': `./${directories.prod.relative}`,
  '#': `./${directories.prod.relative}/_local_modules`,
  haraka: '@exodus/haraka',
  '@react-navigation/bottom-tabs': '@exodus/react-navigation-bottom-tabs',
  '@react-navigation/stack': '@exodus/react-navigation-stack',
  'react-native-safe-area-context': '@exodus/react-native-safe-area-context',
  'react-native-svg': '@exodus/react-native-svg',
  shakl: `./${directories.prod.relative}/_local_modules/shakl`,
  'heat-map-view': `./${directories.prod.relative}/_local_modules/heat-map-view`,
  'react-native-reanimated': '@exodus/react-native-reanimated',
  'react-native-linear-gradient': '@exodus/react-native-linear-gradient',
}
