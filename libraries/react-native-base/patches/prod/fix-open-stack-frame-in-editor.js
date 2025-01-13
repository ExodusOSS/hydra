#!/usr/bin/env node

const path = require('path')
const applyPatch = require('../apply-patch')
const { reactNativeVersion, directories } = require('../../utils/context')

const before = `function openFileInEditor(file: string, lineNumber: number) {
  fetch(getDevServer().url + 'open-stack-frame', {
    method: 'POST',
    body: JSON.stringify({file, lineNumber}),
  });
}`

const after = `function openFileInEditor(file: string, lineNumber: number) {
  fetch(getDevServer().url + 'open-stack-frame', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({file, lineNumber}),
  });
}`

const fixOpenStackFrameInEditor = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken openStackFrameInEditor fix')

  applyPatch(
    path.join(
      directories.nodeModules.prod.absolute,
      'react-native/Libraries/Core/Devtools/openFileInEditor.js'
    ),
    before,
    after
  )
}

fixOpenStackFrameInEditor()
