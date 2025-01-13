const createNftsAnalyticsPlugin = ({ analytics, hasNftsAtom }) => {
  let unsubscribe

  const onStart = () => {
    analytics.requireDefaultEventProperties(['hasNft'])

    unsubscribe = hasNftsAtom.observe((hasNft) => {
      analytics.setDefaultEventProperties({ hasNft })
    })
  }

  const onStop = () => {
    unsubscribe?.()
  }

  return { onStart, onStop }
}

export default createNftsAnalyticsPlugin
