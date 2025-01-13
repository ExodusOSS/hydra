function getArgumentValue(name) {
  const index = process.argv.indexOf(name)

  if (index === -1) return

  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) return true

  return value
}

module.exports = {
  getArgumentValue,
}
