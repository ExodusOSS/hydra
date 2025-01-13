import { delay, HttpResponse } from 'msw'

const randomDelay = (max) => Math.ceil(Math.random() * max)

export const jsonResponse =
  (body, status = 200) =>
  async () => {
    await delay(randomDelay(4))
    return HttpResponse.json(body, { status })
  }

export const statusResponse = (status) => async () => {
  await delay(randomDelay(4))
  return new HttpResponse(null, { status })
}
