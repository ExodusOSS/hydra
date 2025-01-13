const resultFunction = (sites) => sites.filter((site) => site.favorite)

const favoritesSelector = {
  id: 'favorites',
  resultFunction,
  dependencies: [{ selector: 'data' }],
}

export default favoritesSelector
