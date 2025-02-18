const lockActivatesAtSelector = {
  id: 'lockActivatesAt',
  resultFunction: (data) => data.lockActivatesAt,
  dependencies: [{ selector: 'data' }],
}

export default lockActivatesAtSelector
