import { AccountState } from '@exodus/models'

export const AccountStates = {
  bitcoin: class BitcoinAccountState extends AccountState {
    static defaults = {
      cursor: '',
      balance: '0 BTC',
    }
  },
  ethereum: class EthereumAccountState extends AccountState {
    static defaults = {
      cursor: '',
      balance: '0 ETH',
    }
  },
}
