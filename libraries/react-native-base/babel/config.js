const expandPluginPaths = require('./plugin-paths')
const path = require('path')
const { directories } = require('../utils/context')
const createResolver = require('./resolver')

const TEST_PLUGINS = ['babel-plugin-jest-hoist']

const presetPath = path.join(
  directories.prod.absolute,
  '/node_modules/@exodus/metro-react-native-babel-preset'
)

module.exports = function createBabelConfig({
  mappings = [],
  aliases = [],
  enableHermesTransformations,
} = {}) {
  return {
    sourceRoot: directories.prod.absolute,
    presets: [
      [
        `module:${presetPath}`,
        { unstable_transformProfile: enableHermesTransformations ? 'hermes-stable' : 'default' },
      ],
      createResolver({ mappings, aliases }),
    ],
    plugins: [
      ...(process.env.BRACKET_FILES ? [path.join(__dirname, 'babel-plugins/bracket-file.js')] : []),
      ...(process.env.NODE_ENV === 'test'
        ? expandPluginPaths(TEST_PLUGINS, directories.nodeModules.root.absolute)
        : []),
      ...expandPluginPaths(
        [
          // we need the full plugin name here for expandPluginPaths to work
          `@babel/plugin-proposal-numeric-separator`,
          `@babel/plugin-proposal-export-default-from`,
          [`@babel/plugin-proposal-decorators`, { legacy: true }],
          `@babel/plugin-proposal-export-namespace-from`,
          'babel-plugin-transform-inline-environment-variables',
        ],
        directories.nodeModules.prod.absolute
      ),
    ],
    env: {
      production: {
        plugins: expandPluginPaths(
          ['babel-plugin-transform-remove-console'],
          directories.nodeModules.prod.absolute
        ),
      },
    },
  }
}
