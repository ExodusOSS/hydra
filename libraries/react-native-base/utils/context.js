const path = require('path')
const { requireOptional } = require('./require')
const cwd = process.cwd()

const rootDir = path.basename(cwd) === 'src' ? path.dirname(cwd) : cwd
const prodDir = path.join(rootDir, 'src')

const relativeRootDir = path.relative(cwd, rootDir) || './'
const relativeProdDir = path.relative(cwd, prodDir) || './'

const rootNodeModulesDir = path.join(rootDir, 'node_modules')
const prodNodeModulesDir = path.join(rootDir, 'src/node_modules')

const relativeRootNodeModulesDir = path.join(relativeRootDir, 'node_modules')
const relativeProdNodeModulesDir = path.join(relativeProdDir, 'node_modules')

const { version: reactNativeVersion } = require(
  path.join(prodNodeModulesDir, 'react-native/package.json')
)

const { version: reactNavigationCoreVersion } = require(
  path.join(prodNodeModulesDir, '@react-navigation/core/package.json')
)

const { version: rnGetRandomValuesVersion } = require(
  path.join(prodNodeModulesDir, 'react-native-get-random-values/package.json')
)

const jestVersion = requireOptional(path.join(rootNodeModulesDir, 'jest/package.json'))?.version

module.exports = {
  reactNativeVersion,
  reactNavigationCoreVersion,
  rnGetRandomValuesVersion,
  jestVersion,
  directories: {
    root: {
      absolute: rootDir,
      relative: relativeRootDir,
    },
    prod: {
      absolute: prodDir,
      relative: relativeProdDir,
    },
    nodeModules: {
      root: {
        absolute: rootNodeModulesDir,
        relative: relativeRootNodeModulesDir,
      },
      prod: {
        absolute: prodNodeModulesDir,
        relative: relativeProdNodeModulesDir,
      },
    },
  },
}
