import type { ExodusApi } from '@exodus/headless'

export default async function initialize(exodus: ExodusApi) {
  await exodus.application.start()
  await exodus.application.load()
}
