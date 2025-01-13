import { SynchronizedTime } from '../index.js'

let dateNowSpy
let now
let logLines

beforeEach(() => {
  now = 1_487_076_708_000
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now)
  logLines = []
  SynchronizedTime.debug = (line) => logLines.push(line)
})

afterEach(() => {
  dateNowSpy.mockRestore()
  SynchronizedTime.debug = () => {}
})

test('Should return now', () => {
  expect(SynchronizedTime.now()).toBe(now)
  expect(logLines).toEqual([])
})

test('Should return synced now after update', () => {
  const preTime = now - 10
  const serverTime = now - 2
  const postTime = now
  SynchronizedTime.update({ preTime, postTime, serverTime })
  expect(SynchronizedTime.now()).toBe(now + 3)
  expect(logLines).toEqual(['Synchronized time offset: 3 ms'])
})
