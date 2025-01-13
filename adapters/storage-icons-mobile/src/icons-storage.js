import RNFS from '@exodus/react-native-fs'
import { cleanup as cleanupSVG, validate as validateSVG } from '@exodus/svg-safe'
import { isNull } from 'lodash'
import assert from 'minimalistic-assert'
import { ungzip } from 'pako'

const iconNameRegex = new RegExp('^[a-z0-9]{1,10}_[a-z0-9]+_[0-9a-f]{8}$', 'u')

class IconsStorage {
  #logger
  #iconsDirectory
  #customTokensIconsEnabled

  constructor({ logger, config }) {
    assert(config.iconsPath, 'Required "config.iconsPath" is missing')
    this.#iconsDirectory = `${RNFS.DocumentDirectoryPath}/${config.iconsPath}`
    this.#customTokensIconsEnabled = config.customTokensIconsEnabled
    this.#logger = logger
  }

  storeIcons = async (tokens) => {
    if (!this.#customTokensIconsEnabled) return

    await this.#ensureIconsDir()

    return Promise.all(
      tokens.map(async (token) => {
        if (token.icon) {
          await this.#storeIcon(token)
        } else if (isNull(token.icon)) {
          await this.#deleteIcon(token)
        }
      })
    )
  }

  getIcon = async (assetName) => {
    const path = this.#getPath(assetName)
    const fileExists = await RNFS.exists(path)
    if (!fileExists) return null
    const data = await RNFS.readFile(path, 'utf8')
    validateSVG(data)
    return data
  }

  #storeIcon = async (token) => {
    const assetName = token.name || token.assetName
    const path = this.#getPath(assetName)
    const svg = await unzipIcon(token.icon)
    await RNFS.writeFile(path, svg, 'utf8')
  }

  #deleteIcon = async (token) => {
    const assetName = token.name || token.assetName
    const path = `${this.#iconsDirectory}/${assetName}.svg`
    const res = await RNFS.exists(path)
    if (res) {
      await RNFS.unlink(path)
      this.#logger?.debug(`${assetName} icon deleted`)
    }
  }

  #ensureIconsDir = async () => {
    return RNFS.mkdir(this.#iconsDirectory, { NSURLIsExcludedFromBackupKey: true })
  }

  #getPath = (assetName) => {
    assert(iconNameRegex.test(assetName), 'token name contains invalid characters')
    return `${this.#iconsDirectory}/${assetName}.svg`
  }
}

const unzipIcon = (base64) => {
  const buff = Buffer.from(base64, 'base64')
  const arr = Uint8Array.from(buff)
  const data = ungzip(arr, { to: 'string' })
  const str = data.toString('utf8')
  return cleanupSVG(str)
}

const createIconsStorage = (args) => new IconsStorage({ ...args })

export default createIconsStorage
