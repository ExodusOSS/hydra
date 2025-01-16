const untranspiledModules = ['@exodus/[a-zA-Z_-]+', 'p-defer']

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testMatch: ['**/?(*.)+(spec|test).js'],
  clearMocks: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [`node_modules/(?!((jest-)?${untranspiledModules.join('|')}))`],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
