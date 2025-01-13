import _txLog from '../tx-log/tx-log-fixtures.json'

const txLog = Object.keys(_txLog).reduce((txLog, assetName) => {
  txLog[assetName] = []

  for (let i = 0; i < 20; i++) {
    txLog[assetName].push(..._txLog[assetName])
  }

  return txLog
}, {})

export default (CurrencyModules) => {
  Object.keys(CurrencyModules).forEach((implementation) => {
    const label = (part) => `tx-log-x20 ${implementation} ${part}`

    const assets = CurrencyModules[implementation].assets
    const { ethereum } = assets

    console.time(label('total'))

    console.time(label('parsing'))
    const mutations = Object.keys(assets).map((assetName) => {
      if (!txLog[assetName]) return

      const currency = assets[assetName]
      const data = txLog[assetName]

      return data.map((item) => {
        const coinAmount = currency.parse(item.coinAmount)
        let feeAmount

        if (item.feeAmount && coinAmount.isNegative) {
          if (item.feeAmount.endsWith('ETH')) {
            // erc20s
            ethereum.parse(item.feeAmount) // just to make sure it doesn't throw
          } else {
            feeAmount = currency.parse(item.feeAmount)
          }
        }

        return { coinAmount: !item.error && coinAmount, feeAmount }
      })
    })
    console.timeEnd(label('parsing'))

    console.time(label('calculate balance'))
    Object.keys(assets).forEach((assetName, index) => {
      const currency = assets[assetName]
      const assetMutations = mutations[index]

      if (!assetMutations) return

      assetMutations.reduce((balance, item) => {
        if (item.coinAmount) balance = balance.add(item.coinAmount)
        if (item.feeAmount) balance = balance.sub(item.feeAmount)
        return balance
      }, currency.ZERO)
    })
    console.timeEnd(label('calculate balance'))

    console.time(label('toString'))
    Object.keys(assets).forEach((assetName, index) => {
      const assetMutations = mutations[index]

      if (!assetMutations) return

      assetMutations.forEach((item) => {
        if (item.coinAmount) item.coinAmount.toString()
        if (item.feeAmount) item.feeAmount.toString()
      })
    })
    console.timeEnd(label('toString'))

    console.timeEnd(label('total'))

    console.log()

    // no need for a balance check here
  })
}
