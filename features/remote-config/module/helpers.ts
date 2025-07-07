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
