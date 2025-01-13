const createLogger = (namespace) => {
  return {
    trace: (...args) => {},
    debug: (...args) => {},
    log: (...args) => {},
    info: (...args) => {},
    warn: (...args) => {},
    error: (...args) => {},
  }
}

export default createLogger
