import seedlessErrors from '@exodus/seedless-errors'

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
  ...seedlessErrors,
]
