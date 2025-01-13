import txLog from './tx-log-fixtures.json'
import correctBalances from './balances.json'

export default (CurrencyModules) => {
  Object.keys(CurrencyModules).forEach((implementation) => {
    const label = (part) => `tx-log-integers ${implementation} ${part}`

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
    const balances = Object.keys(assets).map((assetName, index) => {
      const currency = assets[assetName]
      const assetMutations = mutations[index]

      if (!assetMutations) return

      const balance = assetMutations.reduce((balance, item) => {
        if (item.coinAmount) balance = balance.add(item.coinAmount)
        if (item.feeAmount) balance = balance.sub(item.feeAmount)
        return balance
      }, currency.ZERO.toBase())

      return balance
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

    Object.keys(assets).forEach((assetName, index) => {
      if (!txLog[assetName]) return

      if (balances[index].toString() !== correctBalances[assetName]) {
        console.error(
          label(
            `balance failure ${assetName}. Expected: ${correctBalances[assetName]}. Actual: ${
              balances[index]
            }`
          )
        )
      }
    })
  })
}
