const isActiveSelector = {
  id: 'isActive',
  resultFunction: (data) => data.mode === 'active',
  dependencies: [{ selector: 'data' }],
}

export default isActiveSelector
