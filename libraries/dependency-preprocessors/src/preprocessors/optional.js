const optional = () => {
  const preprocess = (rootNode, { dependenciesById }) => {
    const ancestors = new Set([rootNode.definition.id])

    const shouldInclude = (node) => {
      if (!node.hasOwnProperty('if')) {
        return true
      }

      if (!node.if) return false
      if (node.if === true) return true

      if (typeof node.if === 'object') {
        const { registered } = node.if

        return registered.every((id) => {
          if (ancestors.has(id)) {
            const cycle = [...ancestors.values(), rootNode.definition.id].join(' --> ')
            throw new Error(`Optional preprocessor dependency requirements are cyclic: ${cycle}`)
          }

          ancestors.add(id)

          const dependency = dependenciesById.get(id)
          return dependency && shouldInclude(dependency)
        })
      }

      throw new Error('`if` condition for optional preprocessor must be typeof boolean or object')
    }

    return shouldInclude(rootNode) ? rootNode : null
  }

  return { type: 'node', preprocess }
}

export default optional
