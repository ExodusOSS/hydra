import { http } from 'msw'

import { jsonResponse } from './utils'

const GENESIS = {
  status: 'success',
  data: {
    assets: {
      aave: { gasLimit: 400_000 },
      algorand: {
        status: {
          title: 'Algorand Governance',
          text: 'Voting session 1 for Algorand Community Governance Period 8 is now open and will close on September 14, 2023.',
          severity: 3,
        },
        servers: ['https://algo.a.exodus.io'],
        indexers: ['https://algo-api.a.exodus.io'],
        nodes: ['https://algo.a.exodus.io'],
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
      },
      amber: {
        status: {
          title: 'Mainnet Launch',
          text: 'AMB has moved to its own blockchain AMB-NET. At the moment, Exodus is not supporting the new mainnet coins. Do not send new AMB coins to Exodus.',
        },
      },
      amp: { gasLimit: 251_000 },
      aragon: {
        status: {
          title: 'Token Migration',
          text: 'Aragon (ANTv1) has migrated to the new Aragon (ANT) token.',
        },
        feeData: { migrationGasLimit: 201_000 },
      },
      aragonv2: {
        status: {
          title: 'Token Migration',
          text: 'If you hold any Aragon (ANTv1), please migrate to Aragon (ANT).',
        },
      },
      ark: {
        servers: ['https://ark.a.exodus.io/api'],
        blockExplorer: {
          addressUrl: 'https://explorer.ark.io/wallets/%s',
          txUrl: 'https://explorer.ark.io/transaction/%s',
        },
      },
      augur: {
        status: {
          title: 'Token Migration',
          text: 'Augur (REPv1) has migrated to the new Augur (REP). Please open the advanced menu in your REPv1 wallet and click on "Claim REP" to perform the swap.',
        },
        feeData: { migrationGasLimit: 205_000 },
      },
      augurv2: {
        status: {
          title: 'New Augur',
          text: 'Welcome to your new Augur (REP) wallet! This token is the upgraded successor to the old Augur (REPv1) token. If you have old Augur (REPv1) tokens, please open the advanced menu in your REPv1 wallet and click on "Claim REP" to perform the swap.',
        },
      },
      aurora: { server: 'https://aurora.a.exodus.io' },
      avalanchec: { serverv1: 'https://avax-c.a.exodus.io/wallet/v1/' },
      babydoge_bsc: {
        status: {
          exchangeTitle: 'Network Fees',
          exchangeText:
            'The Baby Doge Coin (BABYDOGE) token requires a 10% fee per transaction, which may result in high spreads for swaps.',
          exchangeDirection: 'both',
        },
      },
      bcash: {
        forkWarningEnabled: false,
        insightServers: ['https://bitcoincash.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://blockchair.com/bitcoin-cash/address/%s',
          txUrl: 'https://blockchair.com/bitcoin-cash/transaction/%s',
        },
        feeData: { feePerKB: '50000 satoshis' },
      },
      bcashclaim: {
        forkWarningEnabled: false,
        insightServers: ['https://bitcoincash.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://blockchair.com/bitcoin-cash/address/%s',
          txUrl: 'https://blockchair.com/bitcoin-cash/transaction/%s',
        },
        feeData: { feePerKB: '50000 satoshis' },
      },
      bgold: {
        status: {
          exchangeTitle: 'Low Liquidity',
          exchangeText:
            'Swapping into Bitcoin Gold (BTG) may experience an increased price impact, resulting in higher spreads',
          exchangeDirection: 'to',
        },
        insightServers: ['https://bitcoingold.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://btgexplorer.com/address/%s',
          txUrl: 'https://btgexplorer.com/tx/%s',
        },
      },
      bgoldclaim: {
        status: {
          exchangeTitle: 'High Costs',
          exchangeText:
            'Swapping assets for Bitcoin Gold (BTG) may cost a lot due to high price impacts.',
          exchangeDirection: 'to',
        },
        insightServers: ['https://bitcoingold.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://btgexplorer.com/address/%s',
          txUrl: 'https://btgexplorer.com/tx/%s',
        },
      },
      bitcoin: {
        insightServers: ['https://bitcoin-s.a.exodus.io/insight/'],
        rbfEnabled: true,
        feeData: { multiplier: 1.05 },
        feeMultiplier: 1.05,
        maxExtraCpfpFee: 100_000,
        blockExplorer: {
          addressUrl: 'https://mempool.space/address/%s',
          txUrl: 'https://mempool.space/tx/%s',
        },
      },
      bitcoinsv: {
        status: {
          exchangeTitle: 'Swap Delays',
          exchangeText:
            'Swapping Bitcoin SV (BSV) for other assets may take longer than normal to complete and incur higher fees.',
          exchangeDirection: 'from',
        },
        insightServers: ['https://bitcoinsv.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://whatsonchain.com/address/%s',
          txUrl: 'https://whatsonchain.com/tx/%s',
        },
      },
      bitcoinsvclaim: {
        status: {
          exchangeTitle: 'Swap Delays',
          exchangeText:
            'Swapping Bitcoin SV (BSV) for other assets may take longer than normal to complete and incur higher fees.',
          exchangeDirection: 'from',
        },
        insightServers: ['https://bitcoinsv.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://whatsonchain.com/address/%s',
          txUrl: 'https://whatsonchain.com/tx/%s',
        },
      },
      bittorrent: {
        status: {
          title: 'Token Migration',
          text: 'BitTorrent Old (BTTOLD) has migrated to BitTorrent (BTT). Exodus currently does not support the swap. BTTOLD can still be safely stored in your wallet.',
        },
      },
      bnbmainnet: {
        endpoints: [
          { url: 'https://dex.binance.org' },
          { url: 'https://dex-asiapacific.binance.org' },
          { url: 'https://dex-european.binance.org' },
          { url: 'https://dex-atlantic.binance.org' },
        ],
        blockExplorer: {
          addressUrl: 'https://explorer.binance.org/address/%s',
          txUrl: 'https://explorer.binance.org/tx/%s',
        },
      },
      bnx_bsc_f4f64b2a: {
        status: {
          title: 'Token Migration',
          text: 'BinaryX (BNX) has migrated to a new version. Exodus currently does not support the swap. The older version of BNX can still be safely stored in your wallet. If you have any questions, please reach out to us via email at support@exodus.com.',
        },
      },
      bread: {
        status: {
          title: 'Limited Swap Availability',
          text: 'Bread (BRD) has limited swap availability. Sending and receiving are operational. ',
        },
      },
      bsc: { serverv1: 'https://bsc.a.exodus.io/wallet/v1/' },
      cronos: {
        servers: ['https://cronos.a.exodus.io'],
        blockExplorer: {
          /* eslint-disable no-template-curly-in-string */
          addressUrl: 'https://cronoscan.com/address/${address}',
          txUrl: 'https://cronoscan.com/tx/${txId}',
        },
      },
      cardano: {
        servers: ['https://cardano.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://cardanoscan.io/address/%s',
          txUrl: 'https://cardanoscan.io/transaction/%s',
        },
        staking: {
          enabled: true,
          poolHash: '57eb48cdf25980039f087207af09fafb4970018e322d37c11c9a2496',
          apr: 5.3,
        },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
      },
      cdai: {
        status: {
          title: 'New Compound Dai',
          text: 'Welcome to your Compound Dai (CDAI) wallet. Think of your CDAI wallet as your interest-bearing DAI savings account. Whenever you deposit DAI into the Compound Finance app, you receive CDAI in return. Every second that you hold CDAI, you are earning interest on DAI. When you decide to withdraw your DAI using the Compound Finance app, your CDAI will be automatically converted back to DAI along with earned interest.',
        },
      },
      cosmos: {
        endpoints: [
          {
            url: 'https://atom.a.exodus.io/gaiacli',
            urlHub3: 'https://atom3.a.exodus.io/gaiacli',
            urlHub4: 'https://atom4.a.exodus.io/api',
          },
        ],
        blockExplorer: {
          addressUrl: 'https://www.mintscan.io/cosmos/account/%s',
          txUrl: 'https://www.mintscan.io/cosmos/txs/%s',
        },
        feeData: {
          gasAdjustment: 3.8,
          transferGas: 85_000,
          delegateGas: 200_000,
          undelegateGas: 200_000,
          redelegateGas: 200_000,
          withdrawRewardGas: 200_000,
        },
        staking: { apr: 18.97 },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
      },
      dash: {
        insightServers: ['https://dash.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://blockchair.com/dash/address/%s',
          txUrl: 'https://blockchair.com/dash/transaction/%s',
        },
      },
      decred: {
        insightServers: ['https://insight.dcrdata.decred.org/api/'],
        blockExplorer: {
          addressUrl: 'https://dcrdata.decred.org/address/%s',
          txUrl: 'https://dcrdata.decred.org/tx/%s',
        },
      },
      digibyte: {
        insightServers: ['https://digibyte.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://chainz.cryptoid.info/dgb/address.dws?%s',
          txUrl: 'https://chainz.cryptoid.info/dgb/tx.dws?%s',
        },
      },
      dogecoin: {
        insightServers: ['https://dogecoin.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://blockchair.com/dogecoin/address/%s',
          txUrl: 'https://blockchair.com/dogecoin/transaction/%s',
        },
      },
      elrond: { endpoints: [{ url: 'https://elrond.a.exodus.io' }] },
      eosio: {
        bpRpcEndpoints: [
          'https://api.eosbeijing.one',
          'https://api.main.alohaeos.com',
          'https://eos.eoscafeblock.com',
          'https://api.eossweden.org',
          'https://eosbp.atticlab.net',
          'https://eos.greymass.com',
          'https://api.eoseoul.io',
          'https://eos.eosphere.io',
        ],
        historyRpcEndpoints: [
          'https://api.eossweden.org',
          'https://eos.greymass.com',
          'https://api.eosrio.io',
          'https://api-mainnet.starteos.io',
        ],
        historyEndpoints: [
          {
            api: 'exodus',
            url: 'https://eos.a.exodus.io/api/actions',
            txUrl: 'https://eos.a.exodus.io/api/tx',
          },
        ],
        validatorEndpoint: 'https://eos.a.exodus.io/endpoints',
        isDisabledValidator: false,
        staking: { defaultCPUAmount: 0, defaultNETAmount: 0 },
        blockExplorer: {
          addressUrl: 'https://bloks.io/account/%s',
          txUrl: 'https://bloks.io/transaction/%s',
        },
        feeData: { disableFeeDelegation: true, powerUpFeeFactor: 2 },
      },
      ethereum: {
        serverv1: 'https://geth.a.exodus.io/wallet/v1/',
        feeData: {
          enableFeeDelegationInquiry: false,
          disableFeeDelegation: true,
          erc20FuelThreshold: '0.025 ETH',
          fuelThreshold: '0.025 ETH',
          swapFee: '0.02 ETH',
          gasPriceEconomicalRate: 0.85,
          gasPriceMinimumRate: 0.7,
          maximumGasPrice: 250,
          min: '23.05845437 Gwei',
        },
        confirmationsNumber: 30,
        rbfEnabled: true,
        guardExchange: true,
        availableCustomTokens: ['aurora_ethereum_913f9f15', 'luffy_ethereum_380f6341'],
      },
      ethereumclassic: {
        serverv1: 'https://getc.a.exodus.io/wallet/v1/',
        blockExplorer: {
          addressUrl: 'https://blockscout.com/etc/mainnet/address/%s',
          txUrl: 'https://blockscout.com/etc/mainnet/tx/%s',
        },
        feeData: { gasPriceEconomicalRate: 0.7, disableFeeDelegation: true },
        status: {
          exchangeTitle: 'Swap Delays',
          exchangeText:
            'Swapping Ethereum Classic (ETC) for other assets may take longer than normal to complete.',
          exchangeDirection: 'from',
        },
        confirmationsNumber: 5000,
        rbfEnabled: false,
      },
      fantommainnet: {
        serverv1: 'https://fantom.a.exodus.io/wallet/v1/',
        feeData: { max: '10000 Gwei', min: '100 Gwei' },
      },
      filecoin: {
        endpoints: [{ url: 'https://filecoin-nn.a.exodus.io/rpc/v1' }],
        historyEndpoints: [{ api: 'filfox', url: 'https://filfox.info/api/v1' }],
        feeData: { gasAdjustment: 8 },
      },
      firstblood: {
        status: {
          title: 'Token Migration',
          text: 'The migration to the new Dawn Protocol (DAWN) token has completed. The deadline for swapping old FirstBlood (1ST) tokens closed on July 22, 2021. Your old 1ST tokens can now only be exchanged via decentralized exchange platforms such as Uniswap or Sushiswap.',
        },
      },
      gala: {
        status: {
          title: 'Token Migration',
          text: 'The migration to the new GALAv2 token contract has been completed. You will now be able to see your GALAv2 tokens in your wallet.',
        },
      },
      geminidollar: { gasLimit: 75_000 },
      golem: {
        status: {
          title: 'Token Migration',
          text: 'GNT has migrated to GLM. Please open the options menu in your GNT wallet and select "Claim GLM" to perform the swap.',
        },
        feeData: { migrationGasLimit: 121_000 },
      },
      golemv2: {
        status: {
          title: 'Token Migration',
          text: 'Welcome to your new Golem (GLM) wallet. This token is the upgraded successor of the old Golem (GNT) token. If you have old Golem (GNT) tokens, please open the options menu in your GNT wallet and select "Claim GLM" to perform the swap.',
        },
      },
      kyber: {
        status: {
          title: 'Token Migration',
          text: 'This Kyber token has become KNCL (KNC Legacy). Please open the advanced menu in your KNCL wallet and click on "Claim KNC" to perform the migration and swap KNCL for KNC.',
        },
        feeData: { migrationGasLimit: 157_000 },
      },
      kyberv2: {
        status: {
          title: 'New Kyber',
          text: 'Welcome to your new Kyber (KNC) wallet! This token is the upgraded successor to the old Kyber (KNCL) token. If you have old Kyber (KNCL) tokens, please open the advanced menu in your KNCL wallet and click on “Claim KNC” to perform the migration.',
        },
      },
      hedera: {
        blockExplorer: {
          addressUrl: 'https://hederaexplorer.io/search-details/account/%s',
          txUrl: 'https://hederaexplorer.io/search-details/transaction/%s',
        },
      },
      iconmainnet: {
        servers: ['https://ctz.solidwallet.io/api/v3'],
        explorers: ['https://main.tracker.solidwallet.io/v3'],
        blockExplorer: {
          addressUrl: 'https://iconwat.ch/address/%s',
          txUrl: 'https://iconwat.ch/tx/%s',
        },
      },
      kava: {
        staking: {
          enabled: true,
          autoRestakingEnabled: true,
          validator: 'kavavaloper1f94frmnhd9wfa7jg26egnqmymc4cpamlw5ezq7',
          operator: 'kava1xmvz653yd7s0ywwytrlu45v9dzlqsznfmrkyy4',
          url: 'https://staking-s.a.exodus.io/',
        },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
        endpoint: 'https://kava-s.a.exodus.io',
      },
      lisk: { servers: ['https://legacy-mainnet.lisk.com/api'], apis: ['https://service.lisk.io'] },
      litecoin: {
        insightServers: ['https://litecoin.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://live.blockcypher.com/ltc/address/%s',
          txUrl: 'https://live.blockcypher.com/ltc/tx/%s',
        },
      },
      loom: {
        status: {
          title: 'Token Migration',
          text: 'Loom (LOOMv1) has migrated to the new LOOM (LOOM). Please open the advanced menu in your LOOMv1 wallet and click on "Claim LOOM" to perform the swap.',
        },
        feeData: { migrationGasLimit: 119_000 },
      },
      matic: {
        serverv1: 'https://polygon.a.exodus.io/wallet/v1/',
        feeData: { min: '100 Gwei', max: '3000 Gwei' },
      },
      monero: {
        apis: [
          { name: 'NodeApi', url: 'https://xmr.a.exodus.io' },
          { name: 'nodeapi', url: 'https://xmr.a.exodus.io' },
        ],
        blockExplorer: { txUrl: 'https://blockchair.com/monero/transaction/%s' },
        flags: { refresh: true },
      },
      nano: {
        rpcs: ['https://nano.a.exodus.io/'],
        timestamps: ['https://nano-timestamps.a.exodus.io/'],
        blockExplorer: {
          addressUrl: 'https://www.nanolooker.com/account/%s',
          txUrl: 'https://www.nanolooker.com/block/%s',
        },
      },
      nem: { servers: ['https://nem.a.exodus.io'] },
      neo: {
        status: {
          title: 'Neo has migrated to Neo N3',
          text: 'Exodus does not currently support NEO 3.0. The NEO network no longer supports GAS generation with the Legacy Neo (NEO) token. Please be assured that your GAS legacy tokens can still be stored safely in your Exodus wallet',
        },
        insightServers: ['https://neo-mag.a.exodus.io/insight'],
        servers: ['https://neo.a.exodus.io/graphql'],
        blockExplorer: {
          addressUrl: 'https://neoscan.io/address/%s',
          txUrl: 'https://neoscan.io/transaction/%s',
        },
      },
      neogas: {
        blockExplorer: {
          addressUrl: 'https://neoscan.io/address/%s',
          txUrl: 'https://neoscan.io/transaction/%s',
        },
      },
      ontologyServers: {
        rpcs: ['https://ont.a.exodus.io'],
        explorers: ['https://ontexplorer.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://ont.tokenview.io/en/address/%s',
          txUrl: 'https://ont.tokenview.io/en/tx/%s',
        },
      },
      ontology: {
        rpcs: ['https://ont.a.exodus.io'],
        explorers: ['https://ontexplorer.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://ont.tokenview.io/en/address/%s',
          txUrl: 'https://ont.tokenview.io/en/tx/%s',
        },
        feeData: { fee: '0.05 ONG' },
        staking: { enabled: true },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
      },
      ontologygas: {
        rpcs: ['https://ont.a.exodus.io'],
        explorers: ['https://ontexplorer.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://ont.tokenview.io/en/address/%s',
          txUrl: 'https://ont.tokenview.io/en/tx/%s',
        },
      },
      optimism: { server: 'https://optimism-clarity.a.exodus.io' },
      polkadot: {
        apis: [
          {
            name: 'Subscan',
            url: 'https://polkadot-subscan.a.exodus.io/api',
            polkascanSubstrateUrl: 'https://polkascan-substrate.a.exodus.io',
            substrateApiSidecarUrl: 'https://substrate-api-sidecar.a.exodus.io',
          },
        ],
      },
      polygon: {
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
      },
      polymath: {
        status: {
          title: 'Token Migration',
          text: 'Polymath (POLY) has migrated to a new network. Exodus does not currently support the new version of POLY. Your legacy POLY can still be safely stored in your Exodus wallet.',
        },
      },
      populous: {
        status: {
          title: 'Swap Unavailable',
          text: 'Populous (PPT) is temporarily unavailable for swapping. Sending and receiving are operational. We are working on restoring swap availability.',
        },
      },
      qtumignition: { insightServers: ['https://qtum.a.exodus.io/insight/'] },
      ravencoin: {
        insightServers: ['https://raven.a.exodus.io/insight/'],
        feeData: { multiplier: 1.25 },
        feeMultiplier: 1.25,
      },
      ripple: {
        blockExplorer: {
          addressUrl: 'https://xrpscan.com/account/%s',
          txUrl: 'https://xrpscan.com/tx/%s',
        },
        apis: [{ name: 'Magnifier', url: 'https://ripple.a.exodus.io/wallet/v1' }],
        cluster: {
          fullHistoryServer: 'https://ripple.a.exodus.io/wallet/v1',
          partHistoryServer: 'https://ripple.a.exodus.io/wallet/v1',
          partHistoryLedgerCount: 700_000,
        },
        canRegisterSpark: false,
        canClaimSpark: true,
      },
      rootstock: {
        endpoints: [{ url: 'https://rsk.a.exodus.io' }],
        blockExplorer: {
          addressUrl: 'https://explorer.rsk.co/address/%s',
          txUrl: 'https://explorer.rsk.co/tx/%s',
        },
      },
      snx: { gasLimit: 220_000 },
      solana: {
        rpcs: ['https://solana.a.exodus.io'],
        staking: { enabled: true, pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF' },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
        pay: { enabled: true },
      },
      stellar: {
        server: 'https://stellar-proxy.a.exodus.io',
        blockExplorer: {
          addressUrl: 'https://stellar.expert/explorer/public/account/%s',
          txUrl: 'https://stellar.expert/explorer/public/tx/%s',
        },
      },
      stormx: {
        status: {
          title: 'Swap Unavailable',
          text: 'StormX (STMX)  is temporarily unavailable for swapping. Sending and receiving are operational. We are working on restoring swap availability.',
        },
      },
      terra: {
        indexers: ['https://terra.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://finder.terraclassic.community/mainnet/address/%s',
          txUrl: 'https://finder.terraclassic.community/mainnet/tx/%s',
        },
        feeData: { gasLimit: 250_000, taxRate: 0.005 },
        staking: {
          enabled: true,
          validator: 'terravaloper1qt7kqljer7fxzudqdyhx87l7wreeef53s2smsa',
        },
      },
      terrausd_terra: {
        blockExplorer: {
          addressUrl: 'https://atomscan.com/terra/accounts/%s',
          txUrl: 'https://atomscan.com/terra/transactions/%s',
        },
      },
      tetherusd: { gasLimit: 70_000 },
      usdcoin: { gasLimit: 70_000 },
      usdc_fantommainnet_a32ec2ec: {
        status: {
          title: 'Limited Exchange',
          text: 'USD Coin (FTM) has limited swap availability. Sending and receiving are operational.',
        },
      },
      tezos: {
        rpcs: ['https://tezos.a.exodus.io/wallet/v1'],
        conseil: ['https://tezos.a.exodus.io'],
        feeData: { gasLimit: 10_600 },
        staking: {
          enabled: true,
          baker: 'tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM',
          apr: 5.72,
          switchEnabled: true,
        },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
        blockExplorer: {
          addressUrl: 'https://tezblock.io/account/%s',
          txUrl: 'https://tezblock.io/transaction/%s',
        },
      },
      theta: {
        nodes: ['https://theta.a.exodus.io'],
        explorers: ['https://theta-explorer.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://explorer.thetatoken.org/account/%s',
          txUrl: 'https://explorer.thetatoken.org/txs/%s',
        },
        feeData: { fee: '0.3 TFUEL' },
      },
      thorchain_bnbmainnet: {
        status: {
          title: 'Network Migration',
          text: 'THORChain has migrated to its own network. RUNEBNB can still be safely stored in your wallet but will continue to lose value until swapped to its native token. This swap cannot be performed inside Exodus.',
        },
      },
      tronmainnet: {
        apis: [
          {
            name: 'NodeWithTrongrid',
            url: 'https://tron.a.exodus.io',
            historyUrl: 'https://tron.a.exodus.io',
          },
        ],
        blockExplorer: {
          addressUrl: 'https://tronscan.org/#/address/%s',
          txUrl: 'https://tronscan.org/#/transaction/%s',
        },
        feeData: { contractFee: '30 TRX' },
        freezing: {
          disabled: false,
          disableText: 'Freezing TRX is unavailable due to upgrades.',
          showAlertNewVersion: true,
          freeBandwidth: 600,
        },
      },
      vechainthor: {
        blockExplorer: {
          addressUrl: 'https://explore.vechain.org/accounts/%s',
          txUrl: 'https://explore.vechain.org/transactions/%s',
        },
        endpoints: [{ url: 'https://vet.a.exodus.io' }],
        feeData: { disableFeeDelegation: true, delegatorFee: '12 VET' },
        stake: {
          enabled: true,
          geolocation: {
            countries: 'all',
            disabledRegions: {
              NY: 'New York',
              WA: 'Washington',
              US: { NY: 'New York', WA: 'Washington' },
            },
          },
        },
      },
      vethor: {
        blockExplorer: {
          addressUrl: 'https://explore.vechain.org/accounts/%s',
          txUrl: 'https://explore.vechain.org/transactions/%s',
        },
      },
      vertcoin: { insightServers: ['https://vertcoin.a.exodus.io/insight/'] },
      waves: { servers: ['https://waves.a.exodus.io'] },
      walton: {
        status: {
          title: 'Mainnet Launch',
          text: 'Waltonchain (WTC) has migrated to its own blockchain. Your current WTC ERC20 tokens must be swapped for the new WTC mainnet tokens. Exodus is not supporting the new mainnet tokens. Do not send new WTC tokens to Exodus.',
        },
      },
      weth: {
        status: {
          title: 'Swap Unavailable',
          text: 'Wrapped Ether (WETH) is temporarily unavailable for swapping. Sending and receiving are operational. We are working on restoring swap availability.',
        },
      },
      zcash: {
        insightServers: ['https://zcash.a.exodus.io/insight/'],
        blockExplorer: {
          addressUrl: 'https://blockchair.com/zcash/address/%s',
          txUrl: 'https://blockchair.com/zcash/transaction/%s',
        },
      },
      zilliqa: {
        servers: ['https://zilliqa.a.exodus.io'],
        blockExplorer: {
          addressUrl: 'https://viewblock.io/zilliqa/address/%s',
          txUrl: 'https://viewblock.io/zilliqa/tx/0x%s',
        },
        feeData: { gasLimit: 50, gasPrice: '0.002 ZIL' },
      },
    },
    core: {
      exchange: { preferSameNetworkUsdThreshold: 300, promoEnabled: false },
      support: { beaconAvailable: true },
    },
    infrastructure: {
      'price-server': {
        server: 'https://pricing-s.a.exodus.io',
        jitter: 45_000,
        'activate-failover': true,
        'outlier-threshold': 85,
        'failover-disabled-currencies': [
          'BTT',
          'LUNA',
          'VERI',
          'BNXBSCF4F64B2A',
          'CRI3BSC549CA2FF',
          'INXethereumA4597387',
          'RGTethereumABEB2EB5',
        ],
        'movers-disabled-currencies': ['QUORUM', 'WBTCmatic298D6ACE'],
        useOpenExchangeRatesForFiatPrices: false,
        'hardcoded-snapshot-prices': {
          TAAS: 0.837_308_68,
          SNGLS: 0.000_875_79,
          BLUNALUNA: 0.001_651_973_049_702_930_3,
          GALA: 0,
          GALAethereum3910A84E: 0,
        },
        customTokenToBuiltInAssetsSnapshotsFetchRate: 3,
        pricingProvidersSymbolsExclusion: {
          blockfrost: null,
          coingecko: null,
          coinmarketcap: null,
          cryptocompare: null,
          openexchangerates: null,
          stakingrewards: null,
          tinychart: null,
          tzero: null,
        },
        'staking-rate-overrides': {
          xtz: 5.664,
          neo: 0,
          luna: 0,
          algo: 7.96,
          sol: 7,
          atom: 18.97,
          ada: 3.3,
        },
      },
      'affiliate-server': { server: 'https://exit-d.exodus.io' },
      exchange: {
        services: {
          aeroswap: {
            apiKeys: {
              'non-us': '80c55f0b-f734-4af6-9f9b-bb851e663c4f',
              us: '465919d6-794d-461f-b76f-ffdc80e00c56',
            },
          },
          cic: {
            apiKeys: {
              'non-us': '8a073821f10d40fe8cadfa4977787bd8',
              us: '14a1a39ab0b642a588d447a4066c5e9b',
            },
            secrets: {
              'non-us': 'b64c6ae41dd1728fcfcde715ab6b4e71058d967e6ead90db8a0add9ad0a0c341',
              us: '957af273a516d3d5027bf2ff2e0be7b103a99d008e71ae986bfb1f87d4f7173a',
            },
          },
          changehero: {
            apiKeys: {
              international: 'cdb717a102b042d1a9e2ffec42678ca7',
              us: 'cdb717a102b042d1a9e2ffec42678ca7',
            },
            secrets: {
              international: '8540b118cc0e99d8a599407dd7989bdd4620e83777da696e681bfe24901a8531',
              us: '8540b118cc0e99d8a599407dd7989bdd4620e83777da696e681bfe24901a8531',
            },
          },
          changelly: {
            apiKeys: { international: 'c542e745fe514ed581238e9bea45b74a' },
            secrets: {
              international: 'c1db41784189d5fdb687bfa5ec10a3911d7463736b990ade480aa3f497080697',
            },
          },
          fox: { apiKeys: { international: 'EDC0E8825BB668CB' } },
          nexchange: {
            apiKeys: {
              international:
                'ZXhvZHVzOlNaeWdUbmR2ZVE4bndaVTRiQnNDbWhQMlV4dmhvTlN5VGlPeGFBTDI5am51RHVpSU5OWEpl',
            },
          },
          switchain: {
            apiKeys: {
              'non-us': '4e917a27-4003-37ce-a810-cb8444d559bf',
              us: 'aa0e484f-8a16-39a2-b02a-28986c2c5fd4',
            },
          },
          uniswap: { usdMinExchange: 100 },
          'aero-us': {
            url: 'https://api.aeroswap.io/v2',
            geo: 'us',
            apiKey: '465919d6-794d-461f-b76f-ffdc80e00c56',
          },
          'aero-nonus': {
            url: 'https://api.aeroswap.io/v2',
            geo: 'non-us',
            apiKey: '80c55f0b-f734-4af6-9f9b-bb851e663c4f',
          },
          'aero2-us': {
            url: 'https://api.aeroswap.io/v2',
            geo: 'us',
            apiKey: 'e3bb8f51-022a-4ddd-b286-f150fdd608aa',
          },
          'aero2-nonus': {
            url: 'https://api.aeroswap.io/v2',
            geo: 'non-us',
            apiKey: '17825968-7fd7-439f-8ba4-e8e30432d89c',
          },
          'cic-nonus': {
            url: 'https://api2.criptointercambio.com',
            urlV2: 'https://api.criptointercambio.com/v2',
            geo: 'non-us',
            apiKey: '8a073821f10d40fe8cadfa4977787bd8',
            secret: 'b64c6ae41dd1728fcfcde715ab6b4e71058d967e6ead90db8a0add9ad0a0c341',
          },
          'cic-us': {
            url: 'https://api2.criptointercambio.com',
            urlV2: 'https://api.criptointercambio.com/v2',
            geo: 'non-us',
            apiKey: '14a1a39ab0b642a588d447a4066c5e9b',
            secret: '957af273a516d3d5027bf2ff2e0be7b103a99d008e71ae986bfb1f87d4f7173a',
          },
          'changehero-intl': {
            url: 'https://api.changehero.io/v2',
            geo: 'international',
            apiKey: 'cdb717a102b042d1a9e2ffec42678ca7',
            secret: '8540b118cc0e99d8a599407dd7989bdd4620e83777da696e681bfe24901a8531',
          },
          'changehero-us': {
            url: 'https://api.changehero.io/v2',
            geo: 'us',
            apiKey: 'cdb717a102b042d1a9e2ffec42678ca7',
            secret: '8540b118cc0e99d8a599407dd7989bdd4620e83777da696e681bfe24901a8531',
          },
          'changelly-intl': {
            url: 'https://api2.changelly.com',
            geo: 'international',
            apiKey: 'c542e745fe514ed581238e9bea45b74a',
            secret: 'c1db41784189d5fdb687bfa5ec10a3911d7463736b990ade480aa3f497080697',
          },
          'changellyV2-intl': {
            url: 'https://api.changelly.com/v2/',
            geo: 'international',
            apiKey: 'aYCs2+4FQeDYkkZ0ZwOUcVnfnMd2dfwjmTsueyFDgFg=',
            secret:
              '308204bd020100300d06092a864886f70d0101010500048204a7308204a30201000282010100c5227c2a943defba25fd4ef2998239428016585851d9cb7c44bcafb94d919e34954d7abb7ac2f44e96822a41430a6fddbb2dd26e949986384e0d97071dd4413d631715502ab94650f8f19b482f622de68d9d3a69bd6be817d639f29f1d3b6226f9dfc81a1ecfcf460a17816a47c7e85a5509d646cbee7c474910651e99304d7f88845e01018e7030b8b1a68025717d570101fa8467ce8d99d9f3f01fe468f23efe7fc1cf1ac564219a4d4d4649835cfbe5140c18a259f9ff145ef6a745af7f47f26a7cd2494a50bb098f72a46dc9868cc0e4006ff6865626fd05bd7ec751758378463872b2c9c299c705d9add5a8a27630bfc34e7c608362907df6a53a1a2c050203010001028201006c328b37cb795b142e39a3951f900be165efddb94be35ffdeab42d36654ea1287731b9452111d38936ae6686bf4701330fc30c9648d52287d0bf40bf552de448cf14224c87c67cc3807f0b1d49747780ed04f8c48484af34360e440df4bb5d19cb5779ba6c62de7eb0974a1e8d1b397a2ae665472232d8df3f48d25742f8f1ef30bf45bb757a8503c400730cced34aedcba51921d2d98dbc9a03184a12d2b68e123df339255bdc456b37ce3efc42095be49ae56dcf4c5cd531df50205d71725201995950530ccb6b0402fd13b6ce05638f3d5021b8b6e73565170290f82707138f1257e68a95ffc1f1eeb11e753933e33cd14984865f8840c04b7fd3e763bd9902818100e8577aabbcf7a7c00c0553e35972f848d793e87e6a5e79b2194c5f88015c245789e1b5d36c939346720ea9eb0316bb60c17b8ee0c171bfddc54e535b655313a6b8d93c85e8e0d417518d5fd15a82317018167baedb5f7dcc4e8f1cf5bc2224656e310ef70b27838caa0b7ee2875fdbd029cdfa55ff5c05f9d424a56dd24de7af02818100d935411679070b2e857fd912ab917963cde25b7a9c26fb477a82da5c3954d8f1b66f84f70cdbbb119ed59829b55b864e37e349fc1abd2ea91c7933934ab82ccdef48c7691cd5bbd717f969559300c22d2e415fcf3c072cc29ddd127e59498aa212dda466fbc4815a9eb793396022e07e97fc6e042597653930a3bb6f7700a08b02818100907a3d74e7c814cf4e6a4db4f55d91d931fceeb91589f420f4ac52476f990d9c45c84e59cf8da12a5028a02edcb7d9031cada9b64774657c11825841602b9defb1c89c6324e211e1023c6855f5f339acdbbdb7618f56bd123bd3b08d7a54bccf3a0b55a3f792b5b1d5d7da2a214651990b35e3b2705d97f5b79ea624397f6a4f028180373c5db2f350213dd16133b895bcc6dbe48d7da9ee6fd352d80ad2b0c53b9877cf6708af32abe62492f9ca5a40ee677718ab4a333c3183de298980de221038049ea7295ec7a06ac646287ceaf0192f48020d49ea0f5fdbb81a211004e57bd82f6310ce300a326c9ab8e60220831c1b6ed603b18e8868b9ab137d6fbae6ce580502818054a002d0222b56eb24248c9a2fca61979c5de9811f439b041e8abdc7f1952065b66c58278bf53ffcd7bcf6f89205fea3a258e359ab66e851a2b0be58f85917462ea3fdce4ddc86939e82bd19c334844b1279718e07b82eba2e0e44c96fa3a321615e362d53e4db8688f26cf66f687cfa79005bf047ed2fe29b9b37e779a86503',
          },
          'exolix-nonus': {
            url: 'https://exolix.com/api',
            geo: 'non-us',
            apiKey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFjY291bnRpbmdAZXhvZHVzLmlvIiwic3ViIjoyNjcxMSwiaWF0IjoxNjcxMTA3NzM0LCJleHAiOjE4Mjg4OTU3MzR9.nGIw3a_YLTM02HWKxlVArkwpMeQR2ieDVUZ_nxSCVXw',
          },
          'exolix-us': {
            url: 'https://exolix.com/api',
            geo: 'us',
            apiKey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFjY291bnRpbmdAZXhvZHVzLmNvbSIsInN1YiI6MjY3MTIsImlhdCI6MTY3MTEwODM4MywiZXhwIjoxODI4ODk2MzgzfQ.ZibGB9u_9_W_itAw0DUytcx1hl00jveshwrsDhBN-Z4',
          },
          'fox-intl': {
            url: 'https://fox.exchange/api/cs',
            geo: 'international',
            apiKey: 'EDC0E8825BB668CB',
          },
          'nexchange-intl': {
            url: 'https://api.n.exchange/en/api/v1',
            geo: 'international',
            apiKey:
              'ZXhvZHVzOlNaeWdUbmR2ZVE4bndaVTRiQnNDbWhQMlV4dmhvTlN5VGlPeGFBTDI5am51RHVpSU5OWEpl',
          },
          'letsexchange-us': {
            url: 'https://api.letsexchange.io/api',
            geo: 'us',
            apiKey:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjM3LCJoYXNoIjoiZXlKcGRpSTZJazAwWWtSelVuY3haVFoxZVdkTmFYbHJZMVIyVEVFOVBTSXNJblpoYkhWbElqb2lWMkZ6YVRaU2Iza3hhamxWTlVOWFpUZG5NRmRzTURrMldWTnVUa2Q0TW1OMU0wdHVUWEZhY1ZWMlkyZEVhamhWYURCcmQzUXhLMU00V1RaME5IaFVUbmRuUWt0VFdIUXdaekZ6UnpOaFRFOVNjbEJYVTBkVU4wbDNWV2hJUTNWMlNqbFhLM1ZWUldneU5ITTlJaXdpYldGaklqb2lNREJqWkRaalpqTXlPR1UyTURBNU4ySTNaakZsWkdRelpEUXlORE0wWkdJNU9UUTFNRGRsWVdaaU56TXpaREpqWkdFeU16QmtaV0ptWm1KbE1UYzNZU0o5In0sImlzcyI6Imh0dHA6XC9cL2FwaS5sZXRzZXhjaGFuZ2UuaW9cL2FwaVwvdjFcL2FwaS1rZXkiLCJpYXQiOjE2NTU4MjMzNjEsImV4cCI6MTk3NzIzMTM2MSwibmJmIjoxNjU1ODIzMzYxLCJqdGkiOiJCUFlTVGVQRHB4NHRDSDF4In0.bS0BwRWKaWDfF-UAaw3IMys71M4yez0lnKXkC-u2MYQ',
            affiliateId: 'YImsFmsxJJM1mosZ',
          },
          'letsexchange-nonus': {
            url: 'https://api.letsexchange.io/api',
            geo: 'non-us',
            apiKey:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjIwLCJoYXNoIjoiZXlKcGRpSTZJall4TldKVVRVRnFjakJ2YTFZek5XeDZiRUZvTVVFOVBTSXNJblpoYkhWbElqb2lPSGs0VWtocmVVdFhhWGxSTjFsM1dGQTVYQzlITWpJNFJHeGpSbTlGYTFOdlUzaExaa3hUUlcxUFQyaFhSVXBJVmtacE4yNWtXazFYZW1WRE0xTTNSVVZQWjNGMFdVeGFjMlZxWVd0Q04xazFkRVp0YzFKQ01EVjRiRGhCZG05U1pIUkJOalJWTW5Ga2RGVjNQU0lzSW0xaFl5STZJakk1T0dSbE9XVm1ZMkUzWVRnek1EWXhaV1k0TmpsbE1qa3hPREF5TkdRMU16Z3paamRrTkRRNE16aGlZbVZrTkdNeE1USXhORGcxTW1JME9UYzVPR1FpZlE9PSJ9LCJpc3MiOiJodHRwOlwvXC9hcGkubGV0c2V4Y2hhbmdlLmlvXC9hcGlcL3YxXC9hcGkta2V5IiwiaWF0IjoxNjU0Mjc5NzU1LCJleHAiOjE5NzU2ODc3NTUsIm5iZiI6MTY1NDI3OTc1NSwianRpIjoiajhodzZQV0JrUjRybklUWCJ9.xEqdlChiO3TmQcCT3xLnevd0qQxTcaL64SD3NSvwygY',
            affiliateId: 'q2t4ebUuAHp2nDnx',
          },
          'switchain-us': {
            url: 'https://api.switchain.com/rest/v3',
            geo: 'us',
            apiKey: 'aa0e484f-8a16-39a2-b02a-28986c2c5fd4',
          },
          'switchain-nonus': {
            url: 'https://api.switchain.com/rest/v3',
            geo: 'non-us',
            apiKey: '4e917a27-4003-37ce-a810-cb8444d559bf',
          },
          'changenow-nonus': {
            url: 'https://api.changenow.io',
            geo: 'non-us',
            apiKey: 'ce36516d2e4a173d882aab34d0c63307806f3178e355df4c27eaee2ebc948a5c',
          },
          'changenow-us': {
            url: 'https://api.changenow.io',
            geo: 'us',
            apiKey: 'bae05202b42b05cf62d90a9d7e86c1842d546205724d5b6fd729c07a8da6954d',
          },
          'inch-eth': {
            url: 'https://exodus.api.enterprise.1inch.exchange/v4.0/1',
            geo: 'international',
            fee: 2,
            refAddress: '0x22ba2662ccf6A0191675bed265A0F295669a0D1e',
            concurrency: 4,
            usdMax: 50_000,
            protocol: 1,
            usdMin: 45,
            gasLimitMultiplier: 1.03,
            approvalMultiplier: 1.03,
            gasPriceUsdMinimumMultiplier: 20,
            gasPriceShutdownRates: 140,
            approvalGasLimit: 80_000,
            tickersBatchSize: 5,
            cacheDuration: 14_400_000,
            rateOffset: 0.01,
          },
          'inch-bsc': {
            url: 'https://exodus.api.enterprise.1inch.exchange/v4.0/56',
            geo: 'international',
            fee: 2,
            refAddress: '0x22ba2662ccf6A0191675bed265A0F295669a0D1e',
            concurrency: 1,
            usdMax: 50_000,
            protocol: 56,
            usdMin: 30,
            gasLimitMultiplier: 1.5,
            approvalMultiplier: 1.4,
            gasPriceUsdMinimumMultiplier: 175,
            gasPriceShutdownRates: 1000,
            approvalGasLimit: 80_000,
            tickersBatchSize: 4,
            cacheDuration: 5_400_000,
            rateOffset: 0.01,
          },
          'inch-matic': {
            url: 'https://exodus.api.enterprise.1inch.exchange/v4.0/137',
            geo: 'international',
            fee: 2,
            refAddress: '0x22ba2662ccf6A0191675bed265A0F295669a0D1e',
            concurrency: 1,
            usdMin: 30,
            protocol: 137,
            usdMax: 50_000,
            gasLimitMultiplier: 1.5,
            approvalMultiplier: 1.4,
            approvalGasLimit: 80_000,
            gasPriceUsdMinimumMultiplier: 10,
            gasPriceShutdownRates: 1000,
            tickersBatchSize: 4,
            cacheDuration: 5_400_000,
            rateOffset: 0.01,
          },
          'inch-avax': {
            url: 'https://exodus.api.enterprise.1inch.exchange/v4.0/43114',
            geo: 'international',
            fee: 2,
            refAddress: '0x22ba2662ccf6A0191675bed265A0F295669a0D1e',
            concurrency: 1,
            usdMax: 50_000,
            gasLimitMultiplier: 1.5,
            approvalMultiplier: 1.4,
            approvalGasLimit: 80_000,
            gasPriceUsdMinimumMultiplier: 10,
            gasPriceShutdownRates: 1000,
            tickersBatchSize: 4,
            cacheDuration: 5_400_000,
            rateOffset: 0.01,
          },
          'inch-ftm': {
            url: 'https://exodus.api.enterprise.1inch.exchange/v4.0/250',
            geo: 'international',
            fee: 2,
            refAddress: '0x22ba2662ccf6A0191675bed265A0F295669a0D1e',
            concurrency: 1,
            usdMax: 50_000,
            gasLimitMultiplier: 1.5,
            approvalMultiplier: 1.4,
            approvalGasLimit: 80_000,
            gasPriceUsdMinimumMultiplier: 8,
            gasPriceShutdownRates: 1000,
            tickersBatchSize: 4,
            cacheDuration: 5_400_000,
            rateOffset: 0.01,
          },
          'uniswap-eth': { geo: 'international', usdMin: 100 },
          'jupiter-sol': {
            url: 'https://solana.a.exodus.io',
            programIds: [
              'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',
              'JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo',
              'JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph',
              'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
              'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8',
            ],
          },
        },
      },
      browserExtension: { live: true },
      fiatOnboarding: {
        available: true,
        unavailableStatus:
          'Buy Bitcoin is no longer available and may return in the future. For more information, contact support.',
        countries: 'all',
        states: 'none',
        creditCards: true,
        version: [9, 10, 11, 13],
        assetsAvailable: ['bitcoin', 'ethereum', 'usdcoin'],
      },
      fiatOffRamp: { available: true },
      wyreAch: {
        available: true,
        unavailableStatus:
          'Buy Bitcoin is no longer available and may return in the future. For more information, contact Support.',
        countries: 'all',
        states: 'none',
        disableKyc: false,
        enablePreKycPurchase: true,
        version: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        assetsAvailable: ['bitcoin', 'ethereum', 'usdcoin'],
      },
      chat: { available: false, websocketApiUrl: 'wss://support-helpers.a.exodus.io' },
      appVersion: { ios: '23.9.5', android: '23.9.5' },
      primeTrust: {
        available: false,
        disableKyc: false,
        countries: 'all',
        states: 'none',
        version: [5, 6],
      },
    },
    dapps: {
      exodusShares: {
        shutdownSemver: { exodus: '<21.5.14', mobile: '<21.5.14' },
        error: 'Please upgrade Exodus to use the Exodus Shares app.',
        disclaimer: [
          'This communication contains forward-looking statements that are based on our beliefs and assumptions and on information currently available to us. In some cases, you can identify forward-looking statements by the following words: “will,” “expect,” “would,” “intend,” “believe,” or other comparable terminology. Forward-looking statements in this communication include, but are not limited to, statements about our future financial performance, our business plan, our m et opportunities and beliefs and objectives for future operations. These statements involve risks, uncertainties, assumptions and other factors that may cause actual results or performance to be materially different. We cannot assure you that the forward-looking statements will prove to be accurate. These forward-looking statements speak only as of the date hereof. We disclaim any obligation to update these forward-looking statements.',
          'No money or other consideration is being solicited, and if sent in response, will not be accepted. No offer to buy shares of Exodus’s Class A common stock can be accepted and no part of any purchase price can be received until an offering statement is qualified pursuant to the Securities Act of 1933, as amended, and any such offer may be withdrawn or revoked, without obligation or commitment of any kind, at any time before notice of its acceptance given after the qualification date. A person’s indication of interest involves no obligation or commitment of any kind.',
          'No offer to sell securities or solicitation of an offer to buy securities is being made in any state where such offer or sale is not permitted under the blue sky or state securities laws thereof. No offering is being made to individual investors unless and until the offering has been registered in that state or an exemption from registration exists. Exodus intends to complete an offering under Tier 2 of Regulation A and therefore intends to be exempted from state registration pursuant to federal law. Although an exemption from registration under state law may be available, Exodus may still be required to provide a notice filing and pay a fee in individual states. No offer to sell securities or solicitation of an offer to buy securities is being made in any international jurisdiction where such offer or sale is not permitted under the securities laws thereof. No offering is being made to individual investors unless and until the offering has been approved by a competent authority in such international jurisdiction or is made in accordance with an exemption from the relevant international jurisdiction’s securities laws.',
        ],
        secPublicV4: true,
        offeringLiveAt: 1_617_930_000_000,
        secOfferingCircularUrlPath:
          '/Archives/edgar/data/0001821534/000114036121012255/nt10013846x18_253g2.htm',
        offeringClosed: true,
        issuanceEnabled: false,
        issuanceEnabledV2: true,
        tradingEnabled: true,
        tradingEnabledV2: true,
        tzeroOnboardingEnabled: true,
        tzeroEntityOnboardingEnabled: true,
        tzeroParticipatedEntityOnboardingEnabled: true,
        tzeroOnboardingEntityTypes: [
          'llc',
          'corporation',
          'limited-general-partnership',
          'revocable-trust',
          'irrevocable-trust',
          'other',
        ],
      },
      sportx: {
        shutdownSemver: { exodus: '>0.0.1' },
        deprecationBanner: { title: 'SportX is Going Away', text: '', buttonText: 'Close' },
      },
      lightning: {
        enabled: true,
        maxBalanceUSD: 100,
        depositFeePercent: 0.3,
        withdrawFeePercent: 0.3,
        withdrawFeeSats: 5000,
        btcFixedFee: '0.00025',
      },
      nftsGallery: {
        enabled: true,
        nftMaxPreviewSize: 400,
        androidEnabled: true,
        trackingUrl: 'https://nifty.a.exodus.io',
        iosEnabled: true,
      },
      nftsMarketplace: { enabled: true, iosEnabled: false, androidEnabled: true },
      ftx: { auth: { useBrowser: false }, depositsDisabled: true, depositsDisabledUS: true },
      fiatOnramp: {
        enabled: true,
        promoEnabled: false,
        tabButtonEnabled: false,
        zeroFeesEnabled: false,
        rampZeroFeesEnabled: false,
        moonpayZeroFeesEnabled: false,
        providerRampEnabled: true,
        providerMoonpayEnabled: true,
        providerSardineEnabled: true,
        providers: {
          sardine: {
            assets: {
              dot_polkadot: 'polkadot',
              ftm_fantom: 'fantommainnet',
              matic_ethereum: 'polygon',
              mana_ethereum: 'decentraland',
            },
          },
          moonpay: {
            assets: {
              eth_optimism: 'ethereumoptimism',
              usdc_optimism: 'usdc_optimism_574f1c42',
              kava: 'kava',
              atom: 'cosmos',
            },
            enabled: { buy: true, sell: true },
          },
          ramp: {
            assets: {
              OPTIMISM_ETH: 'ethereumoptimism',
              OPTIMISM_USDC: 'usdc_optimism_574f1c42',
              AVAX_USDC: 'usdc_avalanchec_185c8bd7',
              BASE_ETH: 'basemainnet',
              COSMOS_ATOM: 'cosmos',
            },
          },
        },
      },
      exodex: { solana: { enabled: true }, ethereum: { enabled: true }, enabled: false },
      walletConnect: {
        enabled: true,
        iosEnabled: true,
        androidEnabled: true,
        v2: { enabled: true },
        enabledNetworks: [
          'ethereum',
          'matic',
          'bsc',
          'avalanchec',
          'algorand',
          'fantommainnet',
          'tezos',
          'solana',
        ],
        disabledNetworks: ['terra'],
        dappOverrides: {
          'https://app.tinyman.org': { name: 'Tinyman', network: 'algorand' },
          'https://abris.io': { name: 'Arbis', network: 'algorand' },
          'https://www.gringaming.com': { name: 'Grin Gaming', network: 'algorand' },
          'https://app.algofund.co': { name: 'AlgoFund', network: 'algorand' },
          'https://bridge.glitterfinance.org': { name: 'Glitter Finance', network: 'algorand' },
          'https://app.pact.fi': { name: 'Pact', network: 'algorand' },
          'https://algoseas.io': { name: 'AlgoSeas', network: 'algorand' },
          'https://stoi.org': { name: 'STOI', network: 'algorand' },
          'https://dapp.ptokens.io': { name: 'pTokens', network: 'algorand' },
          'https://bridge.ferrum.network': { name: 'Ferrum Network', network: 'algorand' },
          'https://v2.algofi.org': { name: 'Algofi', network: 'algorand' },
          'https://governance.algorand.foundation': { network: 'algorand' },
        },
      },
      exchangeFTX: { shutdownSemver: { exodus: '>0.0.0' } },
      giftCard: {
        enabled: true,
        bitrefillToken: 'h2ikmleB',
        platforms: { android: true, ios: true },
      },
      robinhood: {
        enabled: true,
        assets: {
          bitcoin: 'bitcoin',
          ethereum: 'ethereum',
          dogecoin: 'dogecoin',
          tezos: 'tezos',
          litecoin: 'litecoin',
          usdcoin: 'usdcoin',
        },
        geolocation: {
          countries: { US: 'United States of America (the)' },
          disabledRegions: {
            HI: 'Hawaii',
            NV: 'Nevada',
            NY: 'New York',
            US: { HI: 'Hawaii', NV: 'Nevada', NY: 'New York' },
          },
        },
      },
      referrals: { enabled: true, refereeEnabled: true, referrerEnabled: true },
      'referrals-v2': {
        enabled: true,
        geolocation: {
          countries: {
            AS: 'American Samoa',
            AD: 'Andorra',
            AO: 'Angola',
            AI: 'Anguilla',
            AQ: 'Antarctica',
            AG: 'Antigua and Barbuda',
            AR: 'Argentina',
            AM: 'Armenia',
            AW: 'Aruba',
            AU: 'Australia',
            AT: 'Austria',
            AZ: 'Azerbaijan',
            BS: 'Bahamas (the)',
            BH: 'Bahrain',
            BB: 'Barbados',
            BE: 'Belgium',
            BZ: 'Belize',
            BJ: 'Benin',
            BM: 'Bermuda',
            BT: 'Bhutan',
            BQ: 'Bonaire, Sint Eustatius and Saba',
            BW: 'Botswana',
            BV: 'Bouvet Island',
            BR: 'Brazil',
            IO: 'British Indian Ocean Territory (the)',
            BN: 'Brunei Darussalam',
            BG: 'Bulgaria',
            BI: 'Burundi',
            KH: 'Cambodia',
            CA: 'Canada',
            KY: 'Cayman Islands (the)',
            TD: 'Chad',
            CL: 'Chile',
            CX: 'Christmas Island',
            CC: 'Cocos (Keeling) Islands (the)',
            CO: 'Colombia',
            KM: 'Comoros (the)',
            CK: 'Cook Islands (the)',
            CR: 'Costa Rica',
            CW: 'Curaçao',
            CY: 'Cyprus',
            CZ: 'Czechia',
            DK: 'Denmark',
            DJ: 'Djibouti',
            DM: 'Dominica',
            DO: 'Dominican Republic (the)',
            EC: 'Ecuador',
            SV: 'El Salvador',
            GQ: 'Equatorial Guinea',
            EE: 'Estonia',
            SZ: 'Eswatini',
            FK: 'Falkland Islands (the) [Malvinas]',
            FO: 'Faroe Islands (the)',
            FJ: 'Fiji',
            FI: 'Finland',
            FR: 'France',
            GF: 'French Guiana',
            PF: 'French Polynesia',
            TF: 'French Southern Territories (the)',
            GA: 'Gabon',
            GM: 'Gambia (the)',
            GE: 'Georgia',
            DE: 'Germany',
            GH: 'Ghana',
            GI: 'Gibraltar',
            GR: 'Greece',
            GL: 'Greenland',
            GD: 'Grenada',
            GP: 'Guadeloupe',
            GU: 'Guam',
            GT: 'Guatemala',
            GG: 'Guernsey',
            GN: 'Guinea',
            GW: 'Guinea-Bissau',
            GY: 'Guyana',
            HM: 'Heard Island and McDonald Islands',
            VA: 'Holy See (the)',
            HK: 'Hong Kong',
            HU: 'Hungary',
            IS: 'Iceland',
            IN: 'India',
            ID: 'Indonesia',
            IE: 'Ireland',
            IM: 'Isle of Man',
            IL: 'Israel',
            IT: 'Italy',
            JM: 'Jamaica',
            JP: 'Japan',
            JE: 'Jersey',
            JO: 'Jordan',
            KZ: 'Kazakhstan',
            KI: 'Kiribati',
            KR: 'Korea (the Republic of)',
            KW: 'Kuwait',
            KG: 'Kyrgyzstan',
            LA: "Lao People's Democratic Republic (the)",
            LV: 'Latvia',
            LI: 'Liechtenstein',
            LT: 'Lithuania',
            LU: 'Luxembourg',
            MO: 'Macao',
            MG: 'Madagascar',
            MW: 'Malawi',
            MY: 'Malaysia',
            MV: 'Maldives',
            MT: 'Malta',
            MH: 'Marshall Islands (the)',
            MQ: 'Martinique',
            MR: 'Mauritania',
            YT: 'Mayotte',
            MX: 'Mexico',
            FM: 'Micronesia (Federated States of)',
            MD: 'Moldova (the Republic of)',
            MC: 'Monaco',
            MN: 'Mongolia',
            ME: 'Montenegro',
            MS: 'Montserrat',
            MA: 'Morocco',
            NR: 'Nauru',
            NL: 'Netherlands (the)',
            NC: 'New Caledonia',
            NZ: 'New Zealand',
            NI: 'Nicaragua',
            NE: 'Niger (the)',
            NG: 'Nigeria',
            NU: 'Niue',
            NF: 'Norfolk Island',
            MP: 'Northern Mariana Islands (the)',
            NO: 'Norway',
            OM: 'Oman',
            PW: 'Palau',
            PS: 'Palestine, State of',
            PA: 'Panama',
            PG: 'Papua New Guinea',
            PY: 'Paraguay',
            PE: 'Peru',
            PH: 'Philippines (the)',
            PN: 'Pitcairn',
            PL: 'Poland',
            PT: 'Portugal',
            PR: 'Puerto Rico',
            RO: 'Romania',
            RW: 'Rwanda',
            RE: 'Réunion',
            BL: 'Saint Barthélemy',
            SH: 'Saint Helena, Ascension and Tristan da Cunha',
            KN: 'Saint Kitts and Nevis',
            LC: 'Saint Lucia',
            MF: 'Saint Martin (French part)',
            PM: 'Saint Pierre and Miquelon',
            VC: 'Saint Vincent and the Grenadines',
            WS: 'Samoa',
            SM: 'San Marino',
            ST: 'Sao Tome and Principe',
            SC: 'Seychelles',
            SG: 'Singapore',
            SX: 'Sint Maarten (Dutch part)',
            SK: 'Slovakia',
            SI: 'Slovenia',
            SB: 'Solomon Islands',
            SO: 'Somalia',
            ZA: 'South Africa',
            GS: 'South Georgia and the South Sandwich Islands',
            ES: 'Spain',
            SR: 'Suriname',
            SJ: 'Svalbard and Jan Mayen',
            SE: 'Sweden',
            CH: 'Switzerland',
            TW: 'Taiwan (Province of China)',
            TJ: 'Tajikistan',
            TH: 'Thailand',
            TL: 'Timor-Leste',
            TG: 'Togo',
            TK: 'Tokelau',
            TO: 'Tonga',
            TT: 'Trinidad and Tobago',
            TN: 'Tunisia',
            TR: 'Turkey',
            TM: 'Turkmenistan',
            TC: 'Turks and Caicos Islands (the)',
            TV: 'Tuvalu',
            AE: 'United Arab Emirates',
            GB: 'United Kingdom of Great Britain and Northern Ireland (the)',
            UM: 'United States Minor Outlying Islands (the)',
            US: 'United States of America (the)',
            UY: 'Uruguay',
            UZ: 'Uzbekistan',
            VU: 'Vanuatu',
            VN: 'Viet Nam',
            VG: 'Virgin Islands (British)',
            VI: 'Virgin Islands (U.S.)',
            WF: 'Wallis and Futuna',
            ZM: 'Zambia',
            AX: 'Åland Islands',
          },
        },
      },
      solanaMobileWalletAdapter: { enabled: true },
      web3Browser: {
        enabled: true,
        enabledWebviewVersions: {
          android: '114.0.0.0',
          ios: '12.5.6 <13, 13.6.1 <14, 14.8.1 <15, 15.7.1',
        },
        dapps: {
          'https://app.aave.com': { enabled: true },
          'https://blur.io': { enabled: true },
          'https://app.compound.finance': {
            enabled: true,
            subdomains: ['https://v2-app.compound.finance'],
          },
          'https://www.convexfinance.com': { enabled: false },
          'https://curve.fi': { enabled: false },
          'https://app.ens.domains': { enabled: false },
          'https://stake.lido.fi': { enabled: true },
          'https://magiceden.io': { enabled: true },
          'https://app.nexusmutual.io': { enabled: true },
          'https://opensea.io': { enabled: true },
          'https://stake.rocketpool.net': { enabled: true },
          'https://snapshot.org': { enabled: true },
          'https://splinterlands.com': {
            enabled: true,
            subdomains: ['https://next.splinterlands.com', 'https://www.google.com'],
          },
          'https://unstoppabledomains.com': { enabled: false },
          'https://app.gmx.io': { enabled: true, subdomains: ['https://gmx.io'] },
          'https://bridge.arbitrum.io': { enabled: true },
          'https://www.spritz.finance': {
            enabled: false,
            subdomains: [
              'https://app.spritz.finance',
              'https://auth.spritz.finance',
              'https://accounts.google.com',
            ],
          },
          'https://play.staratlas.com': { enabled: true, subdomains: ['https://staratlas.com'] },
          'https://jup.ag': { enabled: true },
          'https://app.meteora.ag': { enabled: true, subdomains: ['https://meteora.ag'] },
          'https://marinade.finance': { enabled: true },
          'https://rarible.com': { enabled: true },
        },
        dappsSubdomains: {
          'https://treasure.lol': [
            'https://trove.treasure.lol',
            'https://app.treasure.lol',
            'https://magicswap.lol',
          ],
          'https://www.alpacafinance.org': [
            'https://app.alpacafinance.org',
            'https://app-v2.alpacafinance.org',
          ],
          'https://instadapp.io': [
            'https://lite.instadapp.io',
            'https://avocado.instadapp.io',
            'https://defi.instadapp.io',
            'https://polygon.instadapp.io',
            'https://arbitrum.instadapp.io',
            'https://avalanche.instadapp.io',
            'https://optimism.instadapp.io',
            'https://fantom.instadapp.io',
          ],
          'https://app.morpho.xyz': [
            'https://compound.morpho.xyz',
            'https://aavev3.morpho.xyz',
            'https://aavev.morpho.xyz',
          ],
          'https://missioncontrol.planetix.com': [
            'https://planetix.com',
            'https://www.recaptcha.net',
          ],
          'https://stake.lido.fi': ['https://verify.walletconnect.com'],
          'https://bridge.arbitrum.io': ['https://verify.walletconnect.com'],
          'https://yearn.finance': ['https://yearn.fi'],
        },
        disabledDapps: [
          'https://app.axieinfinity.com',
          'https://www.jpg.store',
          'https://dappradar.com',
          'https://www.bitrefill.com',
          'https://peanut.to',
          'https://de.fi',
          'https://www.sedn.xyz',
          'https://exa.market',
          'https://geist.finance',
        ],
      },
      seedless: {
        enabled: true,
        sms: {
          enabled: true,
          geolocation: {
            countries: {
              CH: 'Switzerland',
              DE: 'Germany',
              ES: 'Spain',
              FR: 'France',
              GB: 'United Kingdom',
              IL: 'Israel',
              NL: 'Netherlands (the)',
              NG: 'Nigeria',
              SI: 'Slovenia',
              RS: 'Serbia',
            },
          },
        },
      },
      notifications: { swapNotificationsOptin: { enabled: true } },
    },
    web3Browser: {
      dapps: {
        'https://app.aave.com': { enabled: true },
        'https://blur.io': { enabled: true },
        'https://app.compound.finance': { enabled: true },
        'https://www.convexfinance.com': { enabled: true },
        'https://curve.fi': { enabled: true },
        'https://app.ens.domains': { enabled: true },
        'https://stake.lido.fi': { enabled: true },
        'https://magiceden.io': { enabled: true },
        'https://app.nexusmutual.io': { enabled: false },
        'https://opensea.io': { enabled: true },
        'https://stake.rocketpool.net': { enabled: true },
        'https://snapshot.org': { enabled: true },
        'https://splinterlands.com': { enabled: true },
        'https://unstoppabledomains.com': { enabled: true },
      },
    },
    ethereumProvider: {
      defaultChainIds: [{ origin: 'https://app.radiant.capital', chainId: '0x38' }],
    },
  },
}

const remoteConfigHandlers = [
  http.get('https://remote-config.exodus.io/v1/genesis.json', jsonResponse(GENESIS)),
]

export default remoteConfigHandlers
