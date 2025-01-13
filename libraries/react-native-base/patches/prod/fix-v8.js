#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { reactNativeVersion, directories } = require('../../utils/context')

function copyFolderSync(from, to) {
  fs.rmSync(to, { recursive: true, force: true })
  fs.mkdirSync(to)
  fs.readdirSync(from).forEach((element) => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element))
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element))
    }
  })
}

const fixV8 = () => {
  const name = 'react-native-v8'
  const packagePath = path.join(directories.nodeModules.prod.absolute, name)
  const exists = fs.existsSync(packagePath)

  if (!exists) {
    console.log(`${name} does not exist. Nothing to patch`)
    return
  }

  if (reactNativeVersion !== '0.71.11') throw new Error('broken V8 fix')

  const srcDir = path.join(packagePath, 'dist/com/facebook/react/react-native/0.64.0')

  const destDir = path.join(
    directories.nodeModules.prod.absolute,
    'react-native/android/com/facebook/react/react-native/0.64.0'
  )

  // To Move a folder or file, select overwrite accordingly
  try {
    copyFolderSync(srcDir, destDir)
  } catch (error) {
    console.error(error)
  }
}

fixV8()
