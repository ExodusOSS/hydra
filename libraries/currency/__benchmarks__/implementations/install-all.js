const { modules } = require('./utils')
const { execSync } = require('child_process')

modules.forEach((moduleName) => {
  console.log(`yarn --cwd ./modules/${moduleName}`)
  execSync(`yarn --cwd ./modules/${moduleName}`)
})
