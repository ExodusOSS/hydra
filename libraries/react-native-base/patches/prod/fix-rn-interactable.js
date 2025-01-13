#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { directories } = require('../../utils/context')

const fix = async () => {
  const name = 'react-native-interactable'
  const packagePath = path.join(directories.nodeModules.prod.absolute, name)
  const exists = fs.existsSync(packagePath)

  if (!exists) {
    console.log(`${name} does not exist. Nothing to patch`)
    return
  }

  const ios = path.join(packagePath, 'ios')
  const android = path.join(packagePath, 'android')

  await Promise.all([
    fs.promises.rm(ios, { recursive: true, force: true }),
    fs.promises.rm(android, { recursive: true, force: true }),
  ])

  await Promise.all([
    fs.promises.symlink('lib/ios', ios),
    fs.promises.symlink('lib/android', android),
  ])

  const filePath = path.join(packagePath, 'lib/android/build.gradle')
  const file = fs.readFileSync(filePath, 'utf8')
  console.log('# Fixing rn-interactable build')
  fs.writeFileSync(
    filePath,
    file
      .replace('compileSdkVersion 25', '')
      .replace('buildToolsVersion "25.0.2"', '')
      .replace('testCompile', 'testImplementation')
      .replaceAll('compile', 'implementation')
  )
}

fix()
