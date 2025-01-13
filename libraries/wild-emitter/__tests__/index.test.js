import Emitter from '../src/index.js'

const type = 'avada-kedavra'
const payload = { author: 'voldemort', target: 'harry' }
const event = { type, payload }

test('should subscribe handler', () => {
  const emitter = new Emitter()

  const handler = jest.fn()

  emitter.subscribe(handler)

  emitter.emit(type, payload)

  expect(handler).toHaveBeenCalledWith(event)
})

test('should unsubscribe handler', () => {
  const emitter = new Emitter()

  const handler = jest.fn()

  emitter.subscribe(handler)

  emitter.unsubscribe(handler)

  emitter.emit(type, payload)

  expect(handler).not.toHaveBeenCalled()
})

test('should subscribe multiple handlers', () => {
  const emitter = new Emitter()

  const handler1 = jest.fn()
  const handler2 = jest.fn()
  const handler3 = jest.fn()

  emitter.subscribe(handler1)
  emitter.subscribe(handler2)
  emitter.subscribe(handler3)

  emitter.emit(type, payload)

  const event = { type, payload }

  expect(handler1).toHaveBeenCalledWith(event)
  expect(handler2).toHaveBeenCalledWith(event)
  expect(handler3).toHaveBeenCalledWith(event)
})
