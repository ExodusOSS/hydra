/**
 * Timer that allows you to schedule tasks at fixed intervals.
 *
 * const timer = new Timer(100)
 * timer.start(() => this.hello(options)).catch((err) => {})
 * await timer.stop()
 *
 * It keeps track of the running timers statically. You can pause, stop or clear all the tasks.
 *
 */
export default class Timer {
  /**
   * The registry of known timers that have started and not cleared.
   * @type {Set<Timer>}
   */
  static #running = new Set()

  /**
   * The timer constructor.
   * @param {number} interval - the interval in ms when the timer will tick and run the callback.
   * @param {number} maxFuzziness - the maximum allowed time (in ms) for the timer to tick
   after being paused for an extended period and subsequently resumed. Used to limit resource contention
   through randomization, when multiple timers are resumed at the same time. Defaults to interval.
   */
  constructor(interval, { maxFuzziness } = {}) {
    Timer.validateInterval(interval)
    this.timerId = undefined
    this.interval = interval
    this.maxFuzziness = typeof maxFuzziness === 'number' ? maxFuzziness : interval
    this.isCallbacking = false
    this.isRestarting = false
    this.pending = []
    this.callback = undefined
    this.pauseCheckpointTime = undefined
    this.timeLeftAfterResume = undefined
  }

  /**
   * Starts the timer, user must provide the callback if the timer wasn't started already.
   *
   * Start method will call the callback the first time if the initial is not provided or 0.
   * If initial delay > 0, callback will be executed after the initial delay, then every interval.
   * @param {Function=} callback - the function that's called when the timer ticks.
   * @param {boolean=} delayedStart - If the callback should be executed now or after the interval. Default is false, execute now.
   * @returns {Promise<void>} a promise that resolves now if the timer has started already or delayedStart:true,
   * otherwise it resolves after callback is executed for the first time.
   */
  start(callback, { delayedStart } = {}) {
    this.callback = callback || this.callback
    if (!this.callback) {
      throw new Error('Callback must be provided')
    }

    if (this.timerId) {
      return Promise.resolve()
    }

    this.timeLeftAfterResume = undefined
    Timer.#running.add(this)
    this.pauseCheckpointTime = Date.now()
    if (delayedStart) {
      this.timerId = setTimeout(() => this.tick(true), this.interval)
      return Promise.resolve()
    }

    this.timerId = true
    return this.tick()
  }

  /**
   * Stops the timer finishing up a running callback.
   * @returns {Promise<void>} that resolves when the last callback has finished.
   */
  stop() {
    this.isRestarting = false // do not let it restart if a manual stop has been called
    return this.#stop()
  }

  #stop() {
    if (this.timerId === undefined) {
      // is stopped
      return Promise.resolve()
    }

    clearTimeout(this.timerId)
    this.timeLeftAfterResume = undefined
    Timer.#running.delete(this)
    this.timerId = undefined
    if (this.isCallbacking) {
      // if inside callback(), wait for it to complete
      return new Promise((resolve) => this.pending.push(resolve))
    }

    // this._pending methods won't be called if timer is in idle state
    return Promise.resolve()
  }

  /**
   * Pauses the timer flagging when the next callback should run after resume.
   *
   * E.g, Ticker runs every 10 seconds. It's pause after 3 seconds passed from the last execution. Resume will run the job in 7 seconds
   *
   */
  pause() {
    if (this.timerId === undefined) {
      throw new Error("You cannot pause a timer that hasn't started or it has been stopped!")
    }

    if (this.timeLeftAfterResume !== undefined) {
      return
    }

    const now = Date.now()
    this.timeLeftAfterResume = this.pauseCheckpointTime
      ? Math.max(0, this.interval - (now - this.pauseCheckpointTime))
      : 0
    this.pauseCheckpointTime = now
    clearTimeout(this.timerId)
  }

  /**
   * Resumes the timer. The callback is called after the "left-over" ms seconds from pause's interval have completed.
   */
  resume() {
    if (this.timerId === undefined) {
      throw new Error("You cannot resume a timer that hasn't started or it has been stopped!")
    }

    if (this.timeLeftAfterResume === undefined) {
      return
    }

    const now = Date.now()
    // Case 1: Timer should never run more often than the calculated next tick,
    // (example, if interval=24h and the last tick was 1h ago, we don't want to run after maxFuzziness=20s)
    const nextTickDelay = Math.max(
      this.timeLeftAfterResume - (now - this.pauseCheckpointTime),
      Math.round((this.maxFuzziness * this.timeLeftAfterResume) / this.interval)
    )

    // Case 2: Timer should run at least every "interval", even if there is a larger maxFuzziness,
    // (example, the timer should run within interval=5s, given it was paused for 15 minutes and maxFuzziness=20s)
    this.timerId = setTimeout(
      () => this.tick(true),
      Math.min(this.timeLeftAfterResume, nextTickDelay)
    )

    this.pauseCheckpointTime = now - (this.interval - this.timeLeftAfterResume)
    this.timeLeftAfterResume = undefined
  }

  /**
   * Performs one tick executing the callback. Once the callback has finished, it schedules the next tick in the configured interval.
   * @returns {Promise<void>} that resolves when the callback has finished.
   */
  async tick(swallowErrors = false) {
    try {
      this.isCallbacking = true
      this.pauseCheckpointTime = Date.now()
      await this.callback()
    } catch (err) {
      // Do not allow `tick()` to throw so that `start()` cannot fail because of an error in `callback()`.
      // Throwing in `setTimeout()` is also not useful as it produces an uncaught error.
      // If you need to log this error, catch it in `callback()`
      // We still throw if `tick()` is called explicitly.
      if (!swallowErrors) throw err
    } finally {
      for (const resolve of this.pending) resolve()
      this.pending.length = 0
      this.isCallbacking = false
      const timerIsStopped = this.timerId === undefined
      const timerIsPaused = this.timeLeftAfterResume !== undefined
      if (!timerIsStopped && !timerIsPaused) {
        // Case 1: clearTimeout called in the idle of timer, timer is canceled, callback is not executed.
        // Case 2: clearTimeout called in the middle of callback(), can not stop following setTimeout statement
        // So we need set a check point for case 2
        this.timerId = setTimeout(() => this.tick(true), this.interval)
      }
    }
  }

  /**
   * @returns {boolean} if the timer is running, if it has started and not stopped. Note that pause is still 'running'
   */
  get isRunning() {
    return !!this.timerId || this.isRestarting
  }

  /**
   * Changes the timer interval and restarts it if it is already started
   * @param {number}  newInterval the new interval
   * @returns {Promise<void>} that resolves when the
   */
  async setNewInterval(newInterval) {
    Timer.validateInterval(newInterval)
    this.interval = newInterval
    if (!this.isRunning) return
    this.isRestarting = true
    await this.#stop()
    if (this.isRestarting) {
      const startPromise = this.start()
      // Not awaiting for start() to finish, it sets .timerId synchronously and switches us into isRunning
      this.isRestarting = false
      return startPromise
    }
  }

  /**
   * Validates that the provided interval is a positive finite number. It raises an error if it's not valid.
   * @param {number} interval the interval to ve validated.
   */
  static validateInterval(interval) {
    if (typeof interval !== 'number' || interval <= 0 || !Number.isFinite(interval))
      throw new Error('Interval should be a positive number')
  }

  /**
   * Starts all the known timers. Note that stopped timers are removed from the registry.
   * @returns {Promise<Awaited<void>[]>} that resolves when all the timers have started.
   */
  static async startAll() {
    return Promise.all([...Timer.#running].map((timer) => timer.start()))
  }

  /**
   * Stops all the known registered timers. This method will clean up all the timers from the registry.
   * @returns {Promise<Awaited<void>[]>} a promise that resolves once all timers have stopped.
   */
  static stopAll() {
    return Promise.all([...Timer.#running].map((timer) => timer.stop()))
  }

  /**
   * Pauses all the registered timers. You can resume them later on.
   */
  static pauseAll() {
    ;[...Timer.#running].forEach((timer) => timer.pause())
  }

  /**
   * Resumes all the registered timers that have been paused.
   */
  static resumeAll() {
    ;[...Timer.#running].forEach((timer) => timer.resume())
  }

  /**
   * @returns {number} the number of registered timers.
   */
  static count() {
    return Timer.#running.size
  }
}
