#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { directories, rnGetRandomValuesVersion } = require('../../utils/context')

const fixRNGetRandomValues = () => {
  if (rnGetRandomValuesVersion !== '1.2.0') throw new Error('broken rn-get-random-values build fix')
  const filePath = path.join(
    directories.nodeModules.prod.absolute,
    'react-native-get-random-values/android/build.gradle'
  )

  const file = fs.readFileSync(filePath, 'utf8')
  console.log('# Fixing rn-get-random-values build')
  fs.writeFileSync(
    filePath,
    file
      .replace(`compileSdkVersion safeExtGet('compileSdkVersion', 26)`, '')
      .replace(`buildToolsVersion safeExtGet('buildToolsVersion', '26.0.3')`, '')
      .replace('compile', 'implementation')
  )
}

fixRNGetRandomValues()
