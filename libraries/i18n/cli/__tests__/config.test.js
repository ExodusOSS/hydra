import { createFsFromVolume } from 'memfs'
import { Volume } from 'memfs/lib/volume.js'

import { readConfig } from '../config.js'

const setup = ({ exists = true, properties = {} } = {}) => {
  const fileTree = {
    'locales/en/messages.po': `
      #: src/test.js:1
      msgid "Test"
      msgstr "Test"
    `,
  }

  if (exists) {
    fileTree['.i18nrc'] = JSON.stringify({
      sourceLocale: 'en',
      locales: 'locales/{locale}/messages.po',
      ...properties,
    })
  }

  return { fs: createFsFromVolume(Volume.fromJSON(fileTree)) }
}

describe('config', () => {
  const rootDir = '.'

  it('should return locales', () => {
    const { fs } = setup()

    expect(readConfig(rootDir, fs).locales).toEqual([
      {
        name: 'en',
        file: 'locales/en/messages.po',
        isSource: true,
      },
    ])
  })

  it('should throw if config file is missing', () => {
    const { fs } = setup({ exists: false })

    expect(() => readConfig(rootDir, fs)).toThrowError(new Error('missing .i18nrc config file'))
  })

  it('should return additional modules', () => {
    const additionalModules = ['./localization']
    const { fs } = setup({
      properties: {
        additionalModules,
      },
    })

    expect(readConfig(rootDir, fs).additionalModules).toEqual(additionalModules)
  })

  it('should return additional decorators', () => {
    const additionalDecorators = ['customI18n']
    const { fs } = setup({
      properties: {
        additionalDecorators,
      },
    })

    expect(readConfig(rootDir, fs).additionalDecorators).toEqual(additionalDecorators)
  })

  it('should return ignore regex', () => {
    const ignoreRegex = 'node_modules|__tests__|vendor'
    const { fs } = setup({
      properties: {
        ignoreRegex,
      },
    })

    expect(readConfig(rootDir, fs).ignoreRegex).toEqual(new RegExp(ignoreRegex, 'i'))
  })

  it('should return default ignore regex if none given', () => {
    const { fs } = setup()

    expect(readConfig(rootDir, fs).ignoreRegex).toEqual(/node_modules|__tests__/i)
  })
})
