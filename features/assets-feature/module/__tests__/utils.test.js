import { getFetchErrorMessage } from '../utils.js'

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
