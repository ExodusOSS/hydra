const path = require('path')
const fs = require('fs')

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
const {
  workspaces: { packages: packageRoots },
} = pkg

const hydraPackages = packageRoots.flatMap((root) => {
  const directory = path.dirname(root)
  return fs
    .readdirSync(path.join(__dirname, directory))
    .filter((it) => !it.startsWith('.'))
    .map((folder) => `@exodus/${folder}`)
})

const untranspiledModulePatterns = [
  ...hydraPackages,
  'react-native',
  '@exodus/*',
  '@noble/*',
  'ethereum-cryptography',
  'p-defer',
  'p-debounce', // TODO: remove me after updating basic-utils
  'p-event',
  'p-timeout',
  'delay',
]

/** @type {import('@jest/types').Config.InitialOptions} */
const CI_CONFIG = {
  reporters: ['summary', 'github-actions'],
  coverageReporters: ['json-summary', 'text-summary', 'json'],
}

/** @type {import('@jest/types').Config.InitialOptions} */
const DEV_CONFIG = {
  coverageReporters: ['json-summary', 'text-summary', 'lcov', 'json'],
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transformIgnorePatterns: [`node_modules/(?!((jest-)?${untranspiledModulePatterns.join('|')}))`],
  // https://jestjs.io/docs/en/configuration#testmatch-array-string
  testMatch: ['**/__tests__/**/*.test.?(m)[jt]s?(x)', '**/?(*.)+(spec|test).?(m)[jt]s?(x)'],
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.js')],
  collectCoverage: true,
  testTimeout: 10_000,
  bail: true,
  forceExit: true,
  ...(process.env.CI === 'true' ? CI_CONFIG : DEV_CONFIG),
}
