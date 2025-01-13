const readPkgUp = require('read-pkg-up')
const path = require('path')
const defaultAliases = require('./aliases')
const defaultMappings = require('./mappings')

const { directories } = require('../utils/context')
const { resolvePath } = require(
  path.join(directories.nodeModules.prod.absolute, 'babel-plugin-module-resolver')
)

module.exports = function createResolver({ aliases, mappings: suppliedMappings }) {
  const mappings = new Map([...defaultMappings, ...suppliedMappings])
  return function resolver() {
    return {
      plugins: [
        [
          require.resolve('babel-plugin-module-resolver'),
          {
            // NOTE: Order matters
            alias: {
              ...defaultAliases,
              ...aliases,
            },
            resolvePath(sourcePath, currentFile, opts) {
              const { pkg } = readPkgUp.sync({ cwd: path.dirname(currentFile), normalize: false })
              let newSourcePath = sourcePath
              const parentModuleName = pkg.name
              if (mappings.has(parentModuleName)) {
                const remappedModuleName = mappings.get(parentModuleName).get(sourcePath)
                if (remappedModuleName) {
                  console.log(
                    `remapping ${parentModuleName}'s dependency ${sourcePath} -> ${remappedModuleName}`
                  )
                  newSourcePath = remappedModuleName
                }

                return newSourcePath
              }

              return resolvePath(sourcePath, currentFile, opts)
            },
          },
        ],
      ],
    }
  }
}
