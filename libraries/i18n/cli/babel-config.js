import { loadPartialConfigAsync } from '@babel/core'

const SYNTAX_PLUGINS = [
  'proposal-decorators',
  'proposal-export-default-from',
  'transform-export-namespace-from',
]

const isSyntaxPlugin = (plugin) => SYNTAX_PLUGINS.some((it) => plugin.file?.request.endsWith(it))

export const loadBabelConfig = async ({ rootDir, configFile }) => {
  const { options } = await loadPartialConfigAsync({
    cwd: rootDir,
    configFile,
    babelrc: false,
    envName: 'development',
  })

  return {
    presets: options.presets,
    plugins: options.plugins.filter(isSyntaxPlugin),
  }
}
