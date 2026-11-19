import { filterBuiltInProps, getFetchErrorMessage } from '../utils.js'

describe('getFetchErrorMessage', () => {
  test('message on simple error', async () => {
    const error = new Error('Some Message')
    expect(await getFetchErrorMessage(error)).toEqual('Some Message')
  })

  test('message on valid json response error', async () => {
    const error = new Error('Some Message')
    error.response = {
      status: 500,
      statusText: 'Status Error!',
      text: () => Promise.resolve(JSON.stringify({ message: 'Help Me!' })),
    }
    expect(await getFetchErrorMessage(error)).toEqual('Help Me!')
  })

  test('message on invalid json response error', async () => {
    const error = new Error('Some Message')
    error.response = {
      status: 500,
      statusText: 'Status Error!',
      text: () => Promise.resolve(JSON.stringify({ iAmNotTheMessage: 'Help Me!' })),
    }
    expect(await getFetchErrorMessage(error)).toEqual('Some Message - 500 - Status Error!')
  })

  test('message on html response error', async () => {
    const error = new Error('Some Message')
    error.response = {
      status: 500,
      statusText: 'Status Error!',
      text: () => Promise.resolve('<html>I am down</html>'),
    }
    expect(await getFetchErrorMessage(error)).toEqual('Some Message - 500 - Status Error!') // Do not return random html
  })

  test('message on empty response text', async () => {
    const error = new Error('Some Message')
    error.response = {
      status: 500,
      statusText: 'Status Error!',
      text: () => Promise.resolve(''),
    }
    expect(await getFetchErrorMessage(error)).toEqual('Some Message - 500 - Status Error!') // Do not return random html
  })

  test('message on no response text', async () => {
    const error = new Error('Some Message')
    error.response = {
      status: 500,
      statusText: 'Status Error!',
    }
    expect(await getFetchErrorMessage(error)).toEqual('Some Message - 500 - Status Error!') // Do not return random html
  })
})

describe('filterBuiltInProps', () => {
  test('preserves tags so token search results keep their classification', () => {
    const asset = {
      name: 'aapl_stock_solana',
      assetId: 'aapl',
      baseAssetName: 'solana',
      ticker: 'AAPL',
      displayTicker: 'AAPLon',
      lifecycleStatus: 'c',
      tags: ['ondo_stock_token'],
    }

    expect(filterBuiltInProps(asset)).toMatchObject({
      assetName: 'aapl_stock_solana',
      tags: ['ondo_stock_token'],
    })
  })

  test('omits tags when the asset has none', () => {
    const result = filterBuiltInProps({ name: 'bitcoin', ticker: 'BTC' })
    expect(result).not.toHaveProperty('tags')
  })
})
