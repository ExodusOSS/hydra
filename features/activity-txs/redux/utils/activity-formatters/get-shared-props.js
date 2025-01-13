import typeforce from '@exodus/typeforce'

export const getSharedProps = (opts) => {
  try {
    typeforce(
      {
        txId: '?String',
        date: 'Date',
        id: 'String',
        assetName: 'String', // used to filter by asset on client side
        type: 'String',
        pending: 'Boolean', // tx uses tx.pending, order checks order status
        failed: 'Boolean', // tx uses tx.failed, order uses status
        sent: 'Boolean', // tx.uses tx.sent, nft uses nft.sent
        received: 'Boolean', // tx.uses tx.receive, nft uses !nft.sent
      },
      opts,
      true // no extra props allowed
    )
  } catch (e) {
    console.warn('activity item props dont pass validation in activity selector', e, opts)
  }

  return opts
}
