import { NftsProxyApi } from '@exodus/nfts-proxy'

const createNftsProxy = ({ config, fetch }) => new NftsProxyApi({ baseUrl: config.baseUrl, fetch })

export default createNftsProxy
