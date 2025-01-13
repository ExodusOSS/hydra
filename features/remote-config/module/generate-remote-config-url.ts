import { GetBuildMetadata } from '../types'

export default async function generateRemoteConfigUrl(
  getBuildMetadata: GetBuildMetadata
): Promise<string> {
  const { build } = await getBuildMetadata()
  return `https://remote-config.exodus.io/v1/${encodeURIComponent(build)}.json`
}
