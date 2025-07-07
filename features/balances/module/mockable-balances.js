class Balances {
  #balancesAtom
  #configBalances

  constructor({ config, balancesAtom }) {
    this.#balancesAtom = balancesAtom
    this.#configBalances = config.importReport
  }

  load = async () => {
    this.#balancesAtom.set({ balances: this.#configBalances })
  }

  stop = () => {}
}

const createBalances = (opts) => new Balances(opts)

const mockableBalancesDefinition = {
  id: 'balances',
  type: 'module',
  factory: createBalances,
  dependencies: ['config', 'balancesAtom'],
  public: true,
}

export default mockableBalancesDefinition
