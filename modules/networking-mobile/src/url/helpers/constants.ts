export const SPECIAL_SCHEMES = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
}

export const SCHEME_CHARACTER_ALLOWLIST = ['+', '-', '.']

export const USERINFO_PERCENT_ENCODE_SET = ['/', ':', ';', '=', '@', '[', '\\', ']', '^', '|']
export const COMPONENT_PERCENT_ENCODE_SET = ['$', '%', '&', '+', ',']

export const URL_ENCODED_PERCENT_ENCODE_SET = ['!', "'", '(', ')', '~']

export const PATH_PERCENT_ENCODE_SET = ['?', '`', '{', '}']

export const QUERY_PERCENT_ENCODE_SET = [' ', '"', '#', '<', '>']

export const FRAGMENT_PERCENT_ENCODE_SET = [' ', '"', '<', '>', '`']

export const FAILURE = Symbol('failure')
export const STOP_PROCESSING = Symbol('stop processing')
