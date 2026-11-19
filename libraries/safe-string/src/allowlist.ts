import seedlessErrors from '@exodus/seedless-errors'

// Common HTTP status codes. Safe to expose since they are public protocol-level values.
const httpStatusCodes = [
  '400',
  '401',
  '403',
  '404',
  '408',
  '409',
  '410',
  '413',
  '422',
  '429',
  '500',
  '502',
  '503',
  '504',
]

export default [
  'broadcastTx',
  'otherErr:broadcastTx',
  'retry:broadcastTx',
  'getNftArguments',
  'ethCall',
  'ethCall:executionReverted',
  'estimateGas',
  'getNonce',
  'failed to parse error',
  'failed with error code:',
  ...httpStatusCodes,
  ...seedlessErrors,
]
