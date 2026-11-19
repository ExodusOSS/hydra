const HARDENED_OFFSET = 0x80_00_00_00

export const assets = {
  bitcoin: {
    bip44: HARDENED_OFFSET + 0,
  },
  solana: {
    bip44: HARDENED_OFFSET + 501,
  },
}
