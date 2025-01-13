const isBackgroundSelector = {
  id: 'isBackground',
  resultFunction: (data) => data.mode === 'background',
  dependencies: [{ selector: 'data' }],
}

export default isBackgroundSelector
