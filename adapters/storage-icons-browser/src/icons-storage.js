import ExodusModule from '@exodus/module'
import { cleanup } from '@exodus/svg-safe'
import { isNull, isUndefined } from 'lodash'

import { unzipIcon } from './utils'

class IconsStorage extends ExodusModule {
  #iconsStorage

  constructor({ storage }) {
    super({ name: 'IconsStorage' })
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
    return this.#iconsStorage.get(assetName)
  }

  #storeIcon = async (token) => {
    const assetName = token.name || token.assetName
    const svg = await unzipIcon(token.icon)
    await this.#iconsStorage.set(assetName, cleanup(svg))
  }

  #deleteIcon = async (token) => {
    const assetName = token.name || token.assetName
    await this.#iconsStorage.delete(assetName)
  }
}

const createIconsStorageModule = (args) => new IconsStorage({ ...args })

export default createIconsStorageModule
