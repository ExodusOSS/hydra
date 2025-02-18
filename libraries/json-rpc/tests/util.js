const EventEmitter = require('events')
const RPC = require('../index.js')

exports.delay = function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

exports.createPair = function createPair(opts) {
  const transport1 = new EventEmitter()
  const transport2 = new EventEmitter()

  transport1.write = (data) => setTimeout(() => transport2.emit('data', data))
  transport2.write = (data) => setTimeout(() => transport1.emit('data', data))

  return [new RPC({ transport: transport1, ...opts }), new RPC({ transport: transport2, ...opts })]
}
