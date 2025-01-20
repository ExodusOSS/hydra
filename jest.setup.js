if (process.env.CI === 'true' && process.env.CI_ENABLE_VERBOSE_LOGS !== 'true') {
  console.log = () => {}
  console.debug = () => {}
  console.warn = () => {}
}
