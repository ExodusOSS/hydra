---
sidebar_position: 1
---

# Algorand Provider API

Exodus injects a global API into websites visited by its users at
`window.algorand`.

## Features & limitations

- ✅ Mainnet is supported
- ❌ BetaNet & TestNet are not supported
- ✅ `enableAccounts` & `enableNetwork` are supported
- ✅ `signTxns` & `postTxns` are supported
- ❌ Multisig is not supported
- ✅
  [ARC-0001](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0001.md),
  [ARC-0006](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0006.md),
  [ARC-0007](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0007.md),
  [ARC-0008](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0008.md),
  [ARC-0009](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0009.md),
  [ARC-0010](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0010.md),
  [ARC-0011](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0011.md),

## Methods

### `algorand.enable()`

```typescript
interface EnableNetworkOpts {
  genesisID?: string;
  genesisHash?: GenesisHash;
};

interface EnableAccountsOpts {
  accounts?: AlgorandAddress[];
};

type EnableOpts = (
  EnableNetworkOpts & EnableAccountsOpts
)

interface EnableNetworkResult {
  genesisID: string;
  genesisHash: GenesisHash;
}

interface EnableAccountsResult {
  accounts: AlgorandAddress[];
}

type EnableResult = (
  EnableNetworkResult & EnableAccountsResult
)

algorand.enable(options?: EnableOpts): Promise<EnableResult>
```

Use `enable()` to request access to the user's accounts. This will open a pop-up
asking the user to approve the connection. Upon approval, Exodus will return the
addresses of the user's accounts and network.

#### Example

```typescript
try {
  const resp = await window.algorand.enable()
  // {
  //     "genesisID": "mainnet-v1.0",
  //     "genesisHash": "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=",
  //     "accounts": [
  //         "DDNRASUTBP53KKXTOTBOI5VVPXSRXVW5NCV4HETP3JET4SB7AIO6CFERXY",
  //         "2A4FZYHGFTMZY2PCMH5WTHQIRMCLKP4XZERK32PVCC3LISFG7ZG3FRXUY4",
  //         "GKPG56OV35RI653XJX2GFR5BENAF62IYWUGJENHVBK7O2JK2WWC454H6LA"
  //     ]
  // }
} catch (err) {
  // { code: 4001, message: 'User rejected the request.' }
}
```

### `algorand.signAndPostTxns()`

```typescript
interface WalletTransaction {
  // Base64 encoding of the canonical msgpack encoding of a Transaction.
  txn: string;

  // Optional authorized address used to sign the transaction when the account
  // is rekeyed. Also called the signor/sgnr.
  authAddr?: AlgorandAddress;

  // Optional list of addresses that must sign the transactions
  signers?: AlgorandAddress[];

  // Optional base64 encoding of the canonical msgpack encoding of a
  // SignedTxn corresponding to txn, when signers=[]
  stxn?: string;
}

interface PostTxnsResult {
  txnIDs: string[];
}

algorand.signAndPostTxns(transactions: WalletTransaction[]): Promise<PostTxnsResult>
```

Use `signAndPostTxns()` to request the Exodus user to sign and submit
transactions. If approved, Exodus will sign the transactions using the sender
specified in the transaction (or `authAddr`) and submit them to the Algorand
network. It returns a `Promise` that resolves to the posted transactions result.
The result is an object with a field `txnIDs` containing all the transaction IDs
of the submitted transactions.

#### Example

```typescript
const { accounts } = await window.algorand.enable()

const baseHttpClient = await window.algorand.getAlgodv2Client()
const algodClient = new algosdk.Algodv2(baseHttpClient)
const suggestedParams = await algodClient.getTransactionParams().do()
const transaction1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams,
  from: accounts[0],
  to: accounts[0],
  amount: 1000000, // Equals 1 ALGO
})
const transaction2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams,
  from: accounts[0],
  to: accounts[0],
  amount: 2000000, // Equals 2 ALGO
})

const { txnIDs } = await window.algorand.signAndPostTxns([
  {
    txn: Buffer.from(transaction1.toByte()).toString('base64'),
  },
  {
    txn: Buffer.from(transaction2.toByte()).toString('base64'),
  },
])
```

### `algorand.signTxns()`

```typescript
interface WalletTransaction {
  // Base64 encoding of the canonical msgpack encoding of a Transaction.
  txn: string;

  // Optional authorized address used to sign the transaction when the account
  // is rekeyed. Also called the signor/sgnr.
  authAddr?: AlgorandAddress;

  // Optional list of addresses that must sign the transactions
  signers?: AlgorandAddress[];

  // Optional base64 encoding of the canonical msgpack encoding of a
  // SignedTxn corresponding to txn, when signers=[]
  stxn?: string;
}

type SignTxnsResult = (string | null)[]

algorand.signTxns(transactions: WalletTransaction[]): Promise<SignTxnsResult>
```

Use `signTxns()` to request the Exodus user to sign and submit transactions. If
approved, Exodus will sign the transactions using the sender specified in the
transaction (or `authAddr`) _without_ submitting it to the Algorand network. It
returns a `Promise` that resolves to the raw signed transactions in their Base64
encoded form.

After the transactions have been signed, a site may submit them via
`window.algorand.postTxns` or `algosdk`'s
[`sendRawTransaction`](https://developer.algorand.org/docs/sdks/javascript/#submit-the-transaction).

#### Example

```typescript
const { accounts } = await window.algorand.enable()

const baseHttpClient = await window.algorand.getAlgodv2Client()
const algodClient = new algosdk.Algodv2(baseHttpClient)
const suggestedParams = await algodClient.getTransactionParams().do()
const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams,
  from: accounts[0],
  to: accounts[0],
  amount: 1000000, // Equals 1 ALGO
})

const signedTransactions = await window.algorand.signTxns([
  {
    txn: Buffer.from(transaction.toByte()).toString('base64'),
  },
])
```

### `algorand.postTxns()`

```typescript
interface PostTxnsResult {
  txnIDs: string[];
}

algorand.postTxns(transactions: string[]): Promise<PostTxnsResult>
```

Use `postTxns()` to submit Base64-encoded transactions, an alternative to
`algosdk`'s
[`sendRawTransaction`](https://developer.algorand.org/docs/sdks/javascript/#submit-the-transaction).

#### Example

```typescript
await window.algorand.enable()

const { txnIDs } = await window.algorand.postTxns([
  'gqNzaWfEQPdF6YhJb+VF6krekNShg9/1roWinqLRePCMV2aIp++CgbwlEWZIcN1yial/j5blaItjd6gTTIo8yJpX1lnyAwWjdHhuiaNhbXTOAAGtsKNmZWXNA+iiZnbOAcS7kaNnZW6sbWFpbm5ldC12MS4womdoxCDAYcTY/B293tLXYEvkVo4/bQQZh6w3veS2ILWrOSSK36Jsds4BxL95o3JjdsQg0Dhc4OYs2Zxp4mH7aZ4IiwS1P5fJIq3p9RC2tEim/k2jc25kxCDQOFzg5izZnGniYftpngiLBLU/l8kiren1ELa0SKb+TaR0eXBlo3BheQ==',
])
// ["5EH3LHSB3VOXGV46NLSCFDDLSS4WPFCX3F2R5GY5KFCF7MXSGNFA"]
```

## Transaction Constraints

Some constrains have been placed on the transaction signing request to prevent
any malicious activity from a web3 site interacting with our extension.

### Transaction Types

The following six transaction types are supported (albeit with certain
constraints):

- [Payment (type `pay`)](https://developer.algorand.org/docs/get-details/transactions/#payment-transaction)
- [Asset Configuration (type `acfg`)](https://developer.algorand.org/docs/get-details/transactions/#asset-configuration-transaction)
- [Asset Freeze (type `afrz`)](https://developer.algorand.org/docs/get-details/transactions/#asset-freeze-transaction)
- [Asset Transfer (type `axfer`)](https://developer.algorand.org/docs/get-details/transactions/#asset-transfer-transaction)
- [Application (type `appl`)](https://developer.algorand.org/docs/get-details/transactions/#application-call-transaction)
- [Key Registration (type `keyreg`)](https://developer.algorand.org/docs/get-details/transactions/#key-registration-transaction)

### Rekeying

[Rekeying](https://developer.algorand.org/docs/get-details/accounts/rekey) is a
powerful protocol feature that enables an Algorand account holder to maintain a
static public address while dynamically rotating the authoritative private
spending key(s). This is accomplished by issuing a "rekey-to transaction", which
sets the authorized address field within the account object.

:::caution

Exodus will reject signing any transaction that contains the `rekey` field. This
is to prevent a malicious web3 site from taking over the account.

:::

### Close Remainder

[Closing an account](https://developer.algorand.org/docs/get-details/transactions/#close-an-account)
means removing it from the Algorand ledger. Since there is a minimum balance
requirement for every account on Algorand, the only way to completely remove it
is to use the `Close Remainder To` field.

[Closing an asset](https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-transfer-transaction)
means removing the asset balance from a given account on Algorand.
