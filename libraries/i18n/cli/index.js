#!/usr/bin/env node

import fs from 'fs'
import { resolve } from 'path'
import { argv, cwd, exit } from 'process'
import { getArgumentValue, getPositionalArguments } from './utils/process.js'

import { loadBabelConfig } from './babel-config.js'
import { readConfig } from './config.js'
import extract from './extract/index.js'
import merge from './merge/index.js'

const command = argv[2]

const rootDir = cwd()

const babelConfig = await loadBabelConfig({
  rootDir,
  configFile: resolve(rootDir, getArgumentValue('--babel-config') ?? 'babel.config.js'),
})

const { locales, additionalModules, additionalDecorators, ignoreRegex, scopedLocales } = readConfig(
  rootDir,
  fs
)

if (command === 'extract') {
  const fileNames = getPositionalArguments().map((filesDir) => resolve(rootDir, filesDir))

  const options = {
    rootDir,
    babelConfig,
    additionalModules,
    additionalDecorators,
    ignoreRegex,
  }

  extract(fileNames, locales, options, scopedLocales)

  exit(0)
}

if (command === 'merge') {
  const pathToFileWithChanges = argv[3]
  const pathToSourceFile = resolve(cwd(), './src/locales/es/messages.po')

  merge({
    pathToFileWithChanges,
    pathToSourceFile,
  })
  exit(0)
}

console.error(`command not supported: ${command}`)
exit(1)
