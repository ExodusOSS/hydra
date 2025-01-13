export const PERCENT_ENCODED: Record<string, string> = {
  ' ': '%20',
  '!': '%21',
  '"': '%22',
  '#': '%23',
  $: '%24',
  '%': '%25',
  '&': '%26',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '+': '%2B',
  ',': '%2C',
  '/': '%2F',
  ':': '%3A',
  ';': '%3B',
  '<': '%3C',
  '>': '%3E',
  '=': '%3D',
  '?': '%3F',
  '@': '%40',
  '[': '%5B',
  ']': '%5D',
  '\\': '%5C',
  '^': '%5E',
  '`': '%60',
  '{': '%7B',
  '|': '%7C',
  '}': '%7D',
}

// https://url.spec.whatwg.org/#userinfo-percent-encode-set
export const USERINFO_PERCENT_ENCODE_SET = ['/', ':', ';', '=', '@', '[', '\\', ']', '^', '|']

// https://url.spec.whatwg.org/#path-percent-encode-set
export const PATH_PERCENT_ENCODE_SET = ['?', '`', '{', '}']

// https://url.spec.whatwg.org/#fragment-percent-encode-set
export const FRAGMENT_PERCENT_ENCODE_SET = [' ', '"', '<', '>', '`']
