jest.doMock('../available-asset-names/selector.js', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((value) => value),
  }
})

await import('./available-asset-names.body.js')
