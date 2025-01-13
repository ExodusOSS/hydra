import Timer from '../src/timer.js'

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))

jest.setTimeout(300)

test('Timer should not hang while is stopped', async () => {
  const timer = new Timer(40)
  const callback = async () => sleep(30)
  await timer.start(callback)
  await sleep(50)
  timer.setNewInterval(100)
  await sleep(10)
  await timer.stop()
  await sleep(10)
  expect(timer.isRunning).toBe(false)
})
