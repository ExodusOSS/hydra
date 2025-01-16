import Channel from './channel'

const channels = Object.create(null)

const get = (obj, key) => {
  obj[key] = obj[key] || new Channel({ name: key }) // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
  return obj[key]
}

export default new Proxy(channels, { get })
