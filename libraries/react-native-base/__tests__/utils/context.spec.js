jest.mock(
  '/Users/bruce-wayne/workspace/exodus-mobile/src/node_modules/react-native/package.json',
  () => ({
    version: '0.42.0',
  }),
  { virtual: true }
)

jest.mock(
  '/Users/bruce-wayne/workspace/exodus-mobile/src/node_modules/react-native-code-push/package.json',
  () => ({
    version: '0.73.0',
  }),
  { virtual: true }
)

jest.mock(
  '/Users/bruce-wayne/workspace/exodus-mobile/src/node_modules/@react-navigation/core/package.json',
  () => ({
    version: '1.2.3',
  }),
  { virtual: true }
)
jest.mock(
  '/Users/bruce-wayne/workspace/exodus-mobile/src/node_modules/react-native-get-random-values/package.json',
  () => ({
    version: '1.2.0',
  }),
  { virtual: true }
)

describe('context', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock(
      '/Users/bruce-wayne/workspace/exodus-mobile/node_modules/jest/package.json',
      () => ({
        version: '9.2.3',
      }),
      { virtual: true }
    )
  })

  it('should derive correct paths and versions when cwd is src', () => {
    jest.spyOn(process, 'cwd').mockReturnValue(`/Users/bruce-wayne/workspace/exodus-mobile/src`)

    const context = require('../../utils/context')
    expect(context).toEqual(
      createExpectedContext({
        relativeRootNodeModules: '../node_modules',
        relativeProdNodeModules: 'node_modules',
        relativeRoot: '..',
        relativeProd: './',
      })
    )
  })

  it('should derive correct paths and versions when cwd is /', () => {
    jest.spyOn(process, 'cwd').mockReturnValue(`/Users/bruce-wayne/workspace/exodus-mobile`)
    const context = require('../../utils/context')

    expect(context).toEqual(
      createExpectedContext({
        relativeRootNodeModules: 'node_modules',
        relativeProdNodeModules: 'src/node_modules',
        relativeRoot: './',
        relativeProd: 'src',
      })
    )
  })

  it('should not fail if root modules not present yet', () => {
    jest.unmock('/Users/bruce-wayne/workspace/exodus-mobile/node_modules/jest/package.json')
    const context = require('../../utils/context')
    expect(context.jestVersion).toBeUndefined()
  })
})

const createExpectedContext = ({
  relativeRoot,
  relativeProd,
  relativeRootNodeModules,
  relativeProdNodeModules,
}) => ({
  reactNativeVersion: '0.42.0',
  reactNavigationCoreVersion: '1.2.3',
  rnGetRandomValuesVersion: '1.2.0',
  jestVersion: '9.2.3',
  directories: {
    root: {
      absolute: '/Users/bruce-wayne/workspace/exodus-mobile',
      relative: relativeRoot,
    },
    prod: {
      absolute: '/Users/bruce-wayne/workspace/exodus-mobile/src',
      relative: relativeProd,
    },
    nodeModules: {
      root: {
        absolute: '/Users/bruce-wayne/workspace/exodus-mobile/node_modules',
        relative: relativeRootNodeModules,
      },
      prod: {
        absolute: '/Users/bruce-wayne/workspace/exodus-mobile/src/node_modules',
        relative: relativeProdNodeModules,
      },
    },
  },
})
