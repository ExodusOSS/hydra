/* eslint-disable jest/no-duplicate-hooks */
/* eslint-disable jest/prefer-hooks-in-order */
import Timer from '../src/timer.js'

beforeEach(() => {
  jest.useFakeTimers()
  jest.spyOn(global, 'setTimeout')
})

afterEach(() => {
  return Timer.stopAll()
})

let dateNowSpy
let now
beforeEach(() => {
  now = 1_487_076_708_000
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now)
})

afterEach(() => {
  // Unlock Time
  dateNowSpy.mockRestore()
})

const sleep = (ms) => {
  //   https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function
  // Speeding up time and jobs.
  now = now + ms
  jest.advanceTimersByTime(ms)
  return Promise.resolve()
}

test('timer should fail if invalid interval', async () => {
  expect(() => new Timer(Number.NaN)).toThrowError('Interval should be a positive number')
  expect(() => new Timer(0)).toThrowError('Interval should be a positive number')
  expect(() => new Timer(-10)).toThrowError('Interval should be a positive number')
})

test('timer should start, tick and stop', async () => {
  const timer = new Timer(20)
  let counter = 0
  expect(timer.isRunning).toEqual(false)

  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  await sleep(10)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)

  await sleep(20)
  expect(counter).toEqual(2)

  await sleep(20)
  expect(counter).toEqual(3)

  await timer.stop()
  expect(timer.isRunning).toEqual(false)
  await sleep(30)
  expect(counter).toEqual(3)
})

test('timer should start with delay, tick and stop', async () => {
  const timer = new Timer(20)
  let counter = 0
  expect(timer.isRunning).toEqual(false)
  await timer.start(() => counter++, { delayedStart: true })
  expect(counter).toEqual(0)
  expect(timer.isRunning).toEqual(true)
  await sleep(5)
  expect(counter).toEqual(0)
  await sleep(15)
  expect(counter).toEqual(1)
  await sleep(5)
  expect(counter).toEqual(1)
  await sleep(16)
  expect(counter).toEqual(2)
  await timer.stop()
  expect(timer.isRunning).toEqual(false)
  await sleep(30)
  expect(counter).toEqual(2)
})

test('timer should start with delay, pause and resume', async () => {
  const timer = new Timer(20, { maxFuzziness: 0 })
  let counter = 0
  expect(timer.isRunning).toEqual(false)
  await timer.start(() => counter++, { delayedStart: true })
  expect(counter).toEqual(0)
  expect(timer.isRunning).toEqual(true)
  await sleep(5)
  expect(counter).toEqual(0)
  timer.pause()
  await sleep(30)
  expect(counter).toEqual(0)
  timer.resume()
  await sleep(1)
  expect(counter).toEqual(1)
  await sleep(20)
  expect(counter).toEqual(2)
  await sleep(5)
  expect(counter).toEqual(2)
  await sleep(16)
  expect(counter).toEqual(3)
  await timer.stop()
  expect(timer.isRunning).toEqual(false)
  await sleep(30)
  expect(counter).toEqual(3)
})

test('timer should prevent tick from continuing to be called when paused', async () => {
  const timer = new Timer(20, { maxFuzziness: 0 })
  let counter = 0
  await timer.start(() => counter++, { delayedStart: true })
  await sleep(25)
  expect(counter).toEqual(1)
  await timer.pause()
  await timer.tick()
  await sleep(50)
  await sleep(50)
  await sleep(50)
  expect(counter).toEqual(2)
  await timer.resume()
  await sleep(25)
  expect(counter).toEqual(3)
})

test('timer should start, tick and stop no wait', async () => {
  const timer = new Timer(20)
  let counter = 0
  expect(timer.isRunning).toEqual(false)
  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  await timer.stop()
  await timer.start()
  expect(counter).toEqual(2)
  await sleep(30)
  expect(counter).toEqual(3)
})

test('timer should start, tick and pause, resume when 10 wait', async () => {
  const timer = new Timer(20)
  let counter = 0
  expect(timer.isRunning).toEqual(false)
  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  await sleep(10)
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(10)
  await timer.resume()
  expect(timer.timeLeftAfterResume).toBeUndefined()
  expect(counter).toEqual(1)
  await sleep(15)
  expect(counter).toEqual(2)
})

test('timer should start, then pause and resume multiple times', async () => {
  const timer = new Timer(10, { maxFuzziness: 100 })
  let counter = 0
  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  await sleep(5)
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(5)
  await timer.resume()
  await sleep(3)
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(2)
  await sleep(30)
  await timer.resume()
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(2)
  await timer.resume()
  await sleep(1)
  expect(counter).toEqual(1)
  await sleep(5)
  expect(counter).toEqual(2)
})

test('timer should start, tick and pause, resume when 25 wait', async () => {
  const timer = new Timer(20)
  let counter = 0
  expect(timer.isRunning).toEqual(false)
  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  await sleep(20)
  expect(counter).toEqual(2)
  await sleep(5)
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(15)
  await timer.resume()
  expect(timer.timeLeftAfterResume).toBeUndefined()
  expect(counter).toEqual(2)
  await sleep(15)
  expect(counter).toEqual(3)
})

test('timer should start, tick, pause and resume after elapsed time', async () => {
  const timer = new Timer(20, { maxFuzziness: 15 })
  let counter = 0
  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  await sleep(20)
  expect(counter).toEqual(2)
  await sleep(5)
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(15)
  await sleep(5)
  await timer.resume()
  await sleep(6)
  expect(counter).toEqual(2)
  await sleep(6)
  expect(counter).toEqual(3)
})

test('timer should use fuzziness to prevent resource contention', async () => {
  const timer1 = new Timer(5, { maxFuzziness: 3 })
  let counter1 = 0

  const timer2 = new Timer(7, { maxFuzziness: 10 })
  let counter2 = 0

  const timer3 = new Timer(15, { maxFuzziness: 15 })
  let counter3 = 0

  await Promise.all([
    timer1.start(() => counter1++),
    timer2.start(() => counter2++),
    timer3.start(() => counter3++),
  ])

  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)

  await sleep(3)
  Timer.pauseAll()
  await sleep(30)
  Timer.resumeAll()
  await sleep(2)
  expect(counter1).toEqual(2)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
  await sleep(5)
  expect(counter1).toEqual(3)
  expect(counter2).toEqual(2)
  expect(counter3).toEqual(1)
  await sleep(7)
  expect(counter1).toEqual(4)
  expect(counter2).toEqual(3)
  expect(counter3).toEqual(2)
})

test('timer fuzziness should be ignored when next tick is smaller', async () => {
  const timer = new Timer(10, { maxFuzziness: 300 })
  let counter = 0
  await timer.start(() => counter++)

  await sleep(5)
  expect(counter).toEqual(1)
  await timer.pause()
  expect(timer.timeLeftAfterResume).toEqual(5)
  await sleep(15)
  await timer.resume()
  await sleep(6)
  expect(counter).toEqual(2)
})

test('not started timer should raise on pause', async () => {
  const timer = new Timer(20)
  expect(timer.isRunning).toEqual(false)
  expect(() => timer.pause()).toThrowError(
    "You cannot pause a timer that hasn't started or it has been stopped!"
  )
  let counter = 0
  await timer.start(() => counter++)
  await timer.stop(() => counter++)
  expect(timer.isRunning).toEqual(false)
  expect(() => timer.pause()).toThrowError(
    "You cannot pause a timer that hasn't started or it has been stopped!"
  )
})
test('not started timer should raise on resume', async () => {
  const timer = new Timer(20)
  expect(timer.isRunning).toEqual(false)
  expect(() => timer.resume()).toThrowError(
    "You cannot resume a timer that hasn't started or it has been stopped!"
  )
  let counter = 0
  await timer.start(() => counter++)
  await timer.stop(() => counter++)
  expect(timer.isRunning).toEqual(false)
  expect(() => timer.resume()).toThrowError(
    "You cannot resume a timer that hasn't started or it has been stopped!"
  )
})

test('timer should change interval', async () => {
  const timer = new Timer(20)
  let counter = 0
  expect(timer.isRunning).toEqual(false)

  await timer.start(() => counter++)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  await sleep(10)
  expect(counter).toEqual(1)
  expect(timer.isRunning).toEqual(true)
  jest.advanceTimersByTime(200)
  await timer.setNewInterval(40)
  expect(counter).toEqual(3)
  await sleep(20)
  expect(counter).toEqual(3)
  await sleep(40)
  expect(counter).toEqual(4)
  await timer.stop()
  expect(timer.isRunning).toEqual(false)
  await sleep(40)
  expect(counter).toEqual(4)
})

test('timer should keep registry of instances', async () => {
  const timer1 = new Timer(5)
  let counter1 = 0

  const timer2 = new Timer(10)
  let counter2 = 0

  const timer3 = new Timer(15)
  let counter3 = 0

  expect(Timer.count()).toEqual(0)
  await timer1.start(() => counter1++)
  expect(Timer.count()).toEqual(1)

  await timer2.start(() => counter2++)
  await timer3.start(() => counter3++)
  expect(Timer.count()).toEqual(3)
})

test('timer should stop all', async () => {
  const timer1 = new Timer(5)
  let counter1 = 0

  const timer2 = new Timer(7)
  let counter2 = 0

  const timer3 = new Timer(15)
  let counter3 = 0

  await Promise.all([
    timer1.start(() => counter1++),
    timer2.start(() => counter2++),
    timer3.start(() => counter3++),
  ])
  expect(Timer.count()).toEqual(3)

  await sleep(10)

  expect(counter1).toEqual(2)
  expect(counter2).toEqual(2)
  expect(counter3).toEqual(1)

  await sleep(10)

  expect(counter1).toEqual(3)
  expect(counter2).toEqual(3)
  expect(counter3).toEqual(2)

  await Timer.stopAll()

  expect(Timer.count()).toEqual(0)

  await sleep(30)

  expect(counter1).toEqual(3)
  expect(counter2).toEqual(3)
  expect(counter3).toEqual(2)
})

test('timer start all should not start any after stop all', async () => {
  const timer1 = new Timer(5)
  let counter1 = 0

  const timer2 = new Timer(7)
  let counter2 = 0

  const timer3 = new Timer(15)
  let counter3 = 0

  await Promise.all([
    timer1.start(() => counter1++),
    timer2.start(() => counter2++),
    timer3.start(() => counter3++),
  ])
  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
  await Timer.stopAll()
  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
  expect(Timer.count()).toEqual(0)
  await Timer.startAll()
  // No registered timers, all have been stopped.
  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
})

test('timer resume all should not restart all after pause all', async () => {
  const timer1 = new Timer(5)
  let counter1 = 0

  const timer2 = new Timer(7)
  let counter2 = 0

  const timer3 = new Timer(15)
  let counter3 = 0

  await Promise.all([
    timer1.start(() => counter1++),
    timer2.start(() => counter2++),
    timer3.start(() => counter3++),
  ])
  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
  await Timer.pauseAll()
  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
  expect(Timer.count()).toEqual(3)
  await Timer.resumeAll()
  // Timers are still registered, you can resume them.
  expect(counter1).toEqual(1)
  expect(counter2).toEqual(1)
  expect(counter3).toEqual(1)
})

test('Timer should not be running when it stopped()', async () => {
  const timer = new Timer(50)
  await timer.start(() => {})
  timer.setNewInterval(100)
  await timer.stop()
  expect(timer.isRunning).toBe(false)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
})

test('Timer should report as running while in setNewInterval()', async () => {
  const timer = new Timer(50)
  await timer.start(() => {})
  expect(timer.isRunning).toBe(true)
  const promise = timer.setNewInterval(100)
  expect(timer.isRunning).toBe(true)
  await promise
  expect(timer.isRunning).toBe(true)
  await timer.stop()
  expect(timer.isRunning).toBe(false)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
})

test('Timer should stop after parallel setNewInterval()', async () => {
  const timer = new Timer(50)
  await timer.start(() => {})
  timer.setNewInterval(100) // not awaiting
  await Promise.resolve()
  timer.setNewInterval(150) // not awaiting
  await Promise.resolve()
  await timer.stop()
  expect(timer.isRunning).toBe(false)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
})

test('Timer should not start with just setNewInterval()', async () => {
  const timer = new Timer(50)
  expect(timer.isRunning).toBe(false)
  await timer.setNewInterval(100)
  expect(timer.isRunning).toBe(false)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
})

test('Timer should not restart with just setNewInterval()', async () => {
  const timer = new Timer(50)
  await timer.start(() => {})
  expect(timer.isRunning).toBe(true)
  await timer.stop()
  expect(timer.isRunning).toBe(false)
  await timer.setNewInterval(100)
  expect(timer.isRunning).toBe(false)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
})

test('Timer should use the correct interval when setNewInterval() was called offline', async () => {
  let counter = 0
  const timer = new Timer(50)
  expect(counter).toBe(0)
  await timer.start(() => counter++)
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(1)
  await timer.stop()
  expect(timer.isRunning).toBe(false)
  expect(counter).toBe(1)
  await timer.setNewInterval(150)
  expect(timer.isRunning).toBe(false)
  expect(counter).toBe(1)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
  expect(counter).toBe(1)
  await timer.start()
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(2)
  await sleep(100)
  expect(counter).toBe(2)
  await sleep(50)
  expect(counter).toBe(3)
})

test('Timer should use the correct interval when multiple setNewInterval() were called offline', async () => {
  let counter = 0
  const timer = new Timer(50)
  expect(counter).toBe(0)
  await timer.start(() => counter++)
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(1)
  await timer.stop()
  expect(timer.isRunning).toBe(false)
  expect(counter).toBe(1)
  await Promise.all([
    timer.setNewInterval(10),
    timer.setNewInterval(1000),
    timer.setNewInterval(200),
  ])
  expect(timer.isRunning).toBe(false)
  expect(counter).toBe(1)
  await Promise.resolve()
  expect(timer.isRunning).toBe(false)
  expect(counter).toBe(1)
  await timer.start()
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(2)
  await sleep(100)
  expect(counter).toBe(2)
  await sleep(100)
  expect(counter).toBe(3)
  await sleep(190)
  expect(counter).toBe(3)
  await sleep(10)
  expect(counter).toBe(4)
  expect(timer.interval).toBe(200)
})

test('Timer should use the correct interval when multiple setNewInterval() were called online', async () => {
  let counter = 0
  const timer = new Timer(50)
  expect(counter).toBe(0)
  await timer.start(() => counter++)
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(1)
  await Promise.all([
    timer.setNewInterval(10),
    timer.setNewInterval(1000),
    timer.setNewInterval(200),
  ])
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(2) // only a single tick happens!
  await Promise.resolve()
  expect(timer.isRunning).toBe(true)
  expect(counter).toBe(2)
  await sleep(100)
  expect(counter).toBe(2)
  await sleep(100)
  expect(counter).toBe(3)
  await sleep(190)
  expect(counter).toBe(3)
  await sleep(10)
  expect(counter).toBe(4)
  expect(timer.interval).toBe(200)
})
