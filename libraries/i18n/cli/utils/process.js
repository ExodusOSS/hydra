export function getArgumentValue(name) {
  const index = process.argv.indexOf(name)

  if (index === -1) return

  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) return true

  return value
}

export function getPositionalArguments() {
  return process.argv.slice(2).reduce(
    ({ args, previousArgNamed }, current) => {
      const isNamed = current.startsWith('--')

      if (isNamed) {
        return { args, previousArgNamed: true }
      }

      if (!previousArgNamed) {
        args.push(current)
      }

      return { args, previousArgNamed: false }
    },
    { previousArgNamed: false, args: [] }
  ).args
}
