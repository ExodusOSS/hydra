# `@exodus/bip39`

JavaScript implementation of [Bitcoin BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki): Mnemonic code for generating deterministic keys

This library prefers native webcrypto, so all methods are async.

Prior art: https://github.com/bitcoinjs/bip39

## Installation

```bash
npm install @exodus/bip39
```

## Entropy Sizes

- **128 bits** → 12 words
- **160 bits** → 15 words
- **192 bits** → 18 words
- **224 bits** → 21 words
- **256 bits** → 24 words

## API Reference

### `generateMnemonic({ bitsize, wordlist = english })`

Generate a random mnemonic with a given bitsize.

**Parameters:**

- `bitsize` (number): Entropy size in bits. Must be one of: 128, 160, 192, 224, or 256
- `wordlist` (array, optional): Word list to use. Defaults to English wordlist

**Returns:** Promise<string> - The generated mnemonic phrase

### `mnemonicToSeed({ mnemonic, password, validate, wordlist, format })`

Convert a mnemonic to a seed for key derivation.

**Parameters:**

- `mnemonic` (string): The mnemonic phrase
- `password` (string, optional): Optional passphrase. Defaults to empty string
- `validate` (boolean, optional): Whether to validate the mnemonic. Defaults to true
- `wordlist` (array, optional): Word list for validation. Defaults to English wordlist
- `format` (string, optional): Output format - 'uint8', 'buffer', or 'hex'. Defaults to 'uint8'

**Returns:** Promise<Uint8Array|Buffer|string> - The seed in the specified format

### `mnemonicToEntropy({ mnemonic, wordlist, format })`

Convert a mnemonic back to its original entropy.

**Parameters:**

- `mnemonic` (string): The mnemonic phrase
- `wordlist` (array, optional): Word list to use. Defaults to English wordlist
- `format` (string, optional): Output format - 'uint8', 'buffer', 'hex', or 'null'. Defaults to 'uint8'

**Returns:** Promise<Uint8Array|Buffer|string|null> - The entropy in the specified format

### `entropyToMnemonic({ entropy, wordlist })`

Convert entropy to a mnemonic phrase.

**Parameters:**

- `entropy` (Uint8Array): The entropy bytes. Must be 16, 20, 24, 28, or 32 bytes
- `wordlist` (array, optional): Word list to use. Defaults to English wordlist

**Returns:** Promise<string> - The mnemonic phrase

### `mnemonicIsInvalid({ mnemonic, wordlist })`

> [!WARNING]
> Read carefully! This returns `true` if the mnemonic is _invalid_

**Parameters:**

- `mnemonic` (string): The mnemonic phrase to validate
- `wordlist` (array, optional): Word list to use. Defaults to English wordlist

**Returns:** Promise<boolean> - true if invalid, false if valid

### `wordlistHasWord({ word, wordlist })`

Check if a word exists in a wordlist.

**Parameters:**

- `word` (string): The word to check
- `wordlist` (array, optional): Word list to check. Defaults to English wordlist

**Returns:** boolean - true if word exists in wordlist

## Wordlists

The library comes with an English wordlist by default. For other languages, you'll need to provide them yourself.
