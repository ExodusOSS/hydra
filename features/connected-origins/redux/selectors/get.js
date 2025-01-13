const resultFunction = (connections) => (origin) =>
  connections.find((connection) => origin === connection.origin)

const getSelector = {
  id: 'get',
  resultFunction,
  dependencies: [{ selector: 'data' }],
}

export default getSelector
