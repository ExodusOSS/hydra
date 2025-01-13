const path = require('path')

const expandPluginPaths = (plugins, directory) => {
  return plugins.map((plugin) => {
    if (typeof plugin === 'string') return path.join(directory, plugin)

    const [name, ...options] = plugin
    return [path.join(directory, name), ...options]
  })
}

module.exports = expandPluginPaths
