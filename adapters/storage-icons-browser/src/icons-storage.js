import { isNull, isUndefined } from 'lodash'
import { validate } from '@exodus/svg-safe'
import { unzipIcon } from './utils'

class IconsStorage {
  #iconsStorage

  constructor({ storage }) {
    this.#iconsStorage = storage
  }

  storeIcons = async (tokens) => {
    return Promise.all(
      tokens.map(async (token) => {
        const { icon, ...rest } = token

        if (isUndefined(icon)) return rest

        if (icon) {
          await this.#storeIcon(token)
        } else if (isNull(icon)) {
          await this.#deleteIcon(token)
        }

        return token
      })
    )
  }

  getIcon = async (assetName) => {
    const icon = await this.#iconsStorage.get(assetName)
    if (icon) validate(icon)
    return icon
  }

  #storeIcon = async (token) => {
    const assetName = token.name || token.assetName
    const svg = await unzipIcon(token.icon)
    await this.#iconsStorage.set(assetName, svg)
  }

  #deleteIcon = async (token) => {
    const assetName = token.name || token.assetName
    await this.#iconsStorage.delete(assetName)
  }

  unzipIcon = unzipIcon
}

const createIconsStorageModule = (args) => new IconsStorage({ ...args })

export default createIconsStorageModule
