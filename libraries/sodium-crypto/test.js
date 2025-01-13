const test = require('tape')
const sodium = require('./index.js')
const runTests = require('./tests.js')

runTests(test, sodium)
