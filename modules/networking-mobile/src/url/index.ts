import { URLLike, URLParser, URLSearchParamsLike } from '@exodus/networking-common/url'
import URL from './url'
import URLSearchParams from './url-search-params'

class Parser implements URLParser {
  parse(url: string | URLLike, base?: string | URLLike | undefined): URLLike {
    return new URL(url, base)
  }

  parseSearchParams(
    init?: string[][] | Record<string, string> | string | URLSearchParamsLike | undefined
  ): URLSearchParamsLike {
    return new URLSearchParams(init)
  }
}

export { Parser as URLParser }
