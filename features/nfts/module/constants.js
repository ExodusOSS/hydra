export const MODULE_ID = 'nfts'

export const FUSION_CHANNEL_CONFIG = {
  batchInterval: 1000,
  channelName: 'nfts-config',
  replayLast: true,
  syncStateKey: 'sync:syncstate:nfts-config',
  type: 'nft',
}

export const FUSION_SCHEMA = ['customPrice', 'hidden', 'preImport']
