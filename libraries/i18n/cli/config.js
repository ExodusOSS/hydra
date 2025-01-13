import { resolve } from 'path'
import glob from 'glob'

const { sync } = glob

const CONFIG_FILE_NAME = '.i18nrc'

const LOCALE_PLACEHOLDER = '{locale}'

const readLocales = (config, filesystem) => {
  const localesFiles = sync(config.locales.replace(LOCALE_PLACEHOLDER, '*'), {
    fs: filesystem,
  })

  return localesFiles.map((file) => {
    const index = config.locales.indexOf(LOCALE_PLACEHOLDER)
    const name = file.slice(index, index + 2)
    const isSource = name === config.sourceLocale

    return { name, file, isSource }
  })
}

export const readConfig = (rootDir, filesystem) => {
  const configPath = resolve(rootDir, CONFIG_FILE_NAME)

  if (!filesystem.existsSync(configPath)) {
    throw new Error(`missing ${CONFIG_FILE_NAME} config file`)
  }

  let config

  try {
    config = JSON.parse(filesystem.readFileSync(configPath, 'utf-8'))
  } catch {
    throw new Error(`unable to parse config file`)
  }

  return {
    locales: readLocales(config, filesystem),
    additionalModules: config.additionalModules,
    additionalDecorators: config.additionalDecorators,
    ignoreRegex: new RegExp(config.ignoreRegex || 'node_modules|__tests__', 'i'),
  }
}
