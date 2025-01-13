#!/usr/bin/env node

const path = require('path')

const applyPatch = require('../apply-patch')
const { directories, codePushVersion } = require('../../utils/context')

const before = `        if (RootComponent.prototype.render) {`

const after = `        if (RootComponent.prototype && RootComponent.prototype.render) {`

const fixCodePush = () => {
  if (!codePushVersion) return
  if (codePushVersion !== '6.4.1') throw new Error('broken fetch codepush')

  console.log('# Fixing codepush')
  applyPatch(
    path.join(directories.nodeModules.prod.absolute, 'react-native-code-push/CodePush.js'),
    before,
    after
  )
}

fixCodePush()
