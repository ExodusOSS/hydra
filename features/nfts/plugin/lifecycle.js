import { createAtomObserver } from '@exodus/atoms'

const createNftsLifecyclePlugin = ({
  nfts,
  nftsMonitor,
  port,
  nftsAtom,
  nftsTxsAtom,
  nftsConfigAtom,
  nftsOptimisticAtom,
  nftCollectionStatsAtom,
  nftBatchMonitorStatusAtom,
}) => {
  const nftsAtomObserver = createAtomObserver({
    port,
    atom: nftsAtom,
    event: 'nfts',
  })

  const nftsTxsAtomObserver = createAtomObserver({
    port,
    atom: nftsTxsAtom,
    event: 'nftsTxs',
  })

  const nftsConfigAtomObserver = createAtomObserver({
    port,
    atom: nftsConfigAtom,
    event: 'nftsConfigs',
  })

  const nftsOptimisticAtomObserver = createAtomObserver({
    port,
    atom: nftsOptimisticAtom,
    event: 'nftsOptimistic',
  })

  const nftsCollectionStatsObserver = createAtomObserver({
    port,
    atom: nftCollectionStatsAtom,
    event: 'nftCollectionStats',
  })

  const onLoad = ({ isLocked }) => {
    if (isLocked) return

    nftsAtomObserver.start()
    nftsTxsAtomObserver.start()
    nftsConfigAtomObserver.start()
    nftsOptimisticAtomObserver.start()
    nftsCollectionStatsObserver.start()

    nfts.load()
  }

  const onUnlock = () => {
    nftsAtomObserver.start()
    nftsTxsAtomObserver.start()
    nftsConfigAtomObserver.start()
    nftsOptimisticAtomObserver.start()
    nftsCollectionStatsObserver.start()

    nfts.load()
    nftsMonitor.start()
  }

  const onClear = async () => {
    await Promise.all([
      nfts.clear(),
      nftsAtom.set(undefined),
      nftsTxsAtom.set(undefined),
      nftCollectionStatsAtom.set(undefined),
      nftBatchMonitorStatusAtom.set(undefined),
    ])
  }

  const onStop = async () => {
    nftsAtomObserver.unregister()
    nftsTxsAtomObserver.unregister()
    nftsConfigAtomObserver.unregister()
    nftsOptimisticAtomObserver.unregister()
    nftsCollectionStatsObserver.unregister()
    await nftsMonitor.stop()
  }

  const onLock = async () => {
    nftsMonitor.stop()
  }

  const onImport = () => {
    nftsMonitor.handleNftsOnImport()
  }

  return { onLoad, onUnlock, onClear, onStop, onLock, onImport }
}

export default createNftsLifecyclePlugin
