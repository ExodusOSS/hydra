import { SynchronizedTime } from '@exodus/basic-utils'

export async function synchronizeTime<Response extends { headers: Headers }>(
  fetch: () => Promise<Response>
): Promise<Response> {
  const preTime = SynchronizedTime.now()
  const response = await fetch()
  const postTime = SynchronizedTime.now()
  const dateHeader = response.headers.get('Date')
  if (dateHeader) {
    const serverTime = Date.parse(dateHeader).valueOf()
    if (!Number.isNaN(serverTime)) SynchronizedTime.update({ preTime, postTime, serverTime })
  }

  return response
}

export function isFreezable(val: unknown): boolean {
  return !!val && typeof val === 'object'
}

export function unwrapErrorMessage(e: unknown): string {
  if (typeof e === 'string') {
    return e
  }

  if (e instanceof Error) {
    return e.message
  }

  return `Unknown error type occurred: ${e}`
}
