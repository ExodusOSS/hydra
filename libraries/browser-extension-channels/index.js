import Channel from './channel.js'

const channels = Object.create(null)

const get = (obj, key) => {
  obj[key] = obj[key] || new Channel({ name: key }) // oxlint-disable-line @exodus/oxlint-plugin-hydra/no-param-reassign-prop-only
  return obj[key]
}

export default new Proxy(channels, { get })
