import assert from 'minimalistic-assert'

const buildGraph = (nodes, byId) => {
  const graph = new Map()

  nodes.forEach((node) => {
    if (!graph.has(node.definition.id)) {
      graph.set(node.definition.id, { node, edges: new Set() })
    }

    const order = node.order
    if (!order) return

    order.before.forEach((id) => {
      if (!graph.has(id)) {
        graph.set(id, { node: byId.get(id), edges: new Set() })
      }

      graph.get(id).edges.add(node.definition.id)
    })
  })

  return graph
}

const sort = (graph) => {
  const sorted = []
  const visited = new Set()

  const visit = (id, ancestors = new Set()) => {
    assert(!ancestors.has(id), `Order is cyclic via ${[...ancestors.values(), id].join(' <-- ')}`)

    if (visited.has(id)) {
      return
    }

    ancestors.add(id)
    visited.add(id)

    const newAncestors = new Set(ancestors)
    graph.get(id).edges.forEach((neighborId) => {
      visit(neighborId, newAncestors)
    })

    sorted.push(graph.get(id).node)
  }

  graph.forEach((value, key) => {
    visit(key)
  })

  return sorted
}

const order = () => {
  const preprocess = (dependencies, { dependenciesById }) => {
    if (!dependencies.some((dep) => dep.order)) return dependencies

    const graph = buildGraph(dependencies, dependenciesById)

    return sort(graph)
  }

  return {
    type: 'collection',
    preprocess,
  }
}

export default order
