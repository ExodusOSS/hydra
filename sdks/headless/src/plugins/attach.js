import { LifecycleHook } from '@exodus/application'

const LIFECYCLE_METHOD_TO_HOOK_NAME = Object.fromEntries(
  Object.entries(LifecycleHook).map(([pascalCaseName, hookName]) => [
    `on${pascalCaseName}`,
    hookName,
  ])
)

const attachPlugins = ({ plugins, application, logger, pluginTimeout }) => {
  const lifecycleFuncWrapper = (fn, name) => {
    const timeFn = async (...args) => {
      const timeoutPid = setTimeout(() => {
        logger.warn(`${name} reached time out of ${pluginTimeout}ms and is still running ...`)
      }, pluginTimeout)
      const start = Date.now()
      try {
        return await fn(...args)
      } finally {
        logger.debug(name, `${Date.now() - start}ms`)
        clearTimeout(timeoutPid)
      }
    }

    Object.defineProperty(timeFn, 'name', { value: name, writable: false })

    if (typeof fn.priority === 'number') {
      Object.defineProperty(timeFn, 'priority', { value: fn.priority, writable: false })
    }

    return timeFn
  }

  Object.entries(plugins).forEach(([name, lifecycleMethods]) => {
    const entries = Object.entries(lifecycleMethods || {})

    for (const [lifecycleMethod, fn] of entries) {
      const hookName = LIFECYCLE_METHOD_TO_HOOK_NAME[lifecycleMethod]
      if (hookName) {
        application.hook(hookName, lifecycleFuncWrapper(fn, `plugin ${name}.${lifecycleMethod}`))
      } else {
        logger.error(`plugin "${name}" declares unsupported lifecycle method "${lifecycleMethod}"`)
      }
    }
  })
}

export default attachPlugins
