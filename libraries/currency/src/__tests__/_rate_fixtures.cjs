// we have this instead of
//   from '../_rate_fixtures.json' with { type: 'json' }
// because eslint and prettier break on that in our config

module.exports = require('./_rate_fixtures.json')
