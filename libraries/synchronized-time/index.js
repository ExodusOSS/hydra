export class SynchronizedTime {
  /**
   * Hook to allow clients send debug logs to the console or monitor.
   */
  static debug = () => {}
  static #clockOffset = 0

  /**
   * Calculate the offset given the external server time.
   *
   * Simplified version of https://en.wikipedia.org/wiki/Network_Time_Protocol#Clock_synchronization_algorithm
   * This calculation is as good as the input data.
   * Ideally we would like millisecond resolution for all three time parameters and a symmetric round-trip path for serverTime.
   * @param {object} options
   * @param {number} options.preTime - SynchronizedTime.now() before calling the server.
   * @param {number} options.postTime - SynchronizedTime.now() after getting the server response.
   * @param {number} options.serverTime - The server time, most likely from the date header in the http response.
   */
  static update({ preTime, postTime, serverTime }) {
    const offset = serverTime - (preTime + postTime) / 2
    SynchronizedTime.#clockOffset += offset
    SynchronizedTime.debug(`Synchronized time offset: ${SynchronizedTime.#clockOffset} ms`)
  }

  /**
   * Returns the number of milliseconds between midnight, January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
   *
   * The value is adapted to include the external server time offset.
   * @returns {number} - the syncronized now
   */
  static now() {
    return Math.floor(Date.now() + SynchronizedTime.#clockOffset)
  }
}
