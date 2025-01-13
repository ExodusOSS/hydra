function requireOptional(path) {
  try {
    return require(path)
  } catch {}
}

module.exports = {
  requireOptional,
}
