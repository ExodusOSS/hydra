/**
 * These addresses are derived from the team's shared Trezor seed phrase
 * and all future additions to this fixture must use that seed phrase.
 *
 * All these addresses have been verified manually on desktop and shown
 * on the Trezor device to ensure compatibility between the two.
 */
export const trezorAddressesFixture = {
  trezor_0_69b383b8477be56d6ff5ba24cff0c24e: {
    bitcoin: [
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: '363X2DSXeRHRZoZso6xr1oJzxLYpVin9AW',
      },
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 12,
        expectedAddress: '38JRntfoXAv3TP8fsM91ieb4rY1JSSHbcy',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: '3JTayXaovs7JKtoxJuTyEFzs9SMbni1jfS',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 12,
        expectedAddress: '34NsNYWbQcZ1ZVtDGniqXZzbULwWUSQEdW',
      },
      {
        purpose: 84,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'bc1quv5u46jwcvsx7t0cutfaxa36kuktf8ays8745g',
      },
      {
        purpose: 84,
        chainIndex: 0,
        addressIndex: 12,
        expectedAddress: 'bc1qhyxtxz7xqnll6t2zh32y46ee095w4cpjmm2xl2',
      },
      {
        purpose: 84,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'bc1q5726a29zxnrcknk32aakf2zygqpu54fve85wqy',
      },
      {
        purpose: 84,
        chainIndex: 1,
        addressIndex: 12,
        expectedAddress: 'bc1qayna9xjwms584um50mlva4hthzp0w2x9ppwnvu',
      },
      // {
      //   purpose: 86,
      //   chainIndex: 0,
      //   addressIndex: 0,
      //   expectedAddress: 'bc1p9t34znhhxvfkvtvyn6lwg5fnzg8muh7d07xjtyvd885hwvzggy5sqcne85',
      // },
      // {
      //   purpose: 86,
      //   chainIndex: 0,
      //   addressIndex: 12,
      //   expectedAddress: 'bc1pqncamqvkf7f2k63rn3nxxypfp2fgvyuur4z3qg25j0tu2d64c4csjlaqv2',
      // },
      // {
      //   purpose: 86,
      //   chainIndex: 1,
      //   addressIndex: 0,
      //   expectedAddress: 'bc1plh48xphkguykl6447jhm5ep89p57mx7unwsr5sjfkvugpsf0tgqq3cl2fd',
      // },
      // {
      //   purpose: 86,
      //   chainIndex: 1,
      //   addressIndex: 12,
      //   expectedAddress: 'bc1p96zp000rznhu444ylrlrhjychvm84c0x8dcrcfvk8nsqfdset53sucp2vs',
      // },
    ],
    cardano: [
      {
        purpose: 1852,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress:
          'addr1q8ax5kdzp30lcsxr8rlt9xmpuqqjwx9yn88gj9cfnvnrmfge7mgyyh6ma4vljxqh2ml6ykme33phf5f55p9q3cmnv76q0kf2y7',
      },
    ],
    monero: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress:
          '42w4WA7oZ8jevooLgvyXUiAG3NeeCrAsBa6WmsUnT81FKrEB3wyD6CBCPtgmGnZCJDRgSdpuovznKCX8uUrNr6xz3vP33pM',
      },
    ],
    dash: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'XfpKps95U6FUruLMs5Y3Kx9SpTZi2HsvpF',
      },
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 9,
        expectedAddress: 'XxTNEWELYKuAB3gr6hXbN3znRCZ4amUBzQ',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'XyZg6aabVRTxKWYD8W2YcSc1cxdD3tAkYP',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 9,
        expectedAddress: 'XbesjJaNVGY5MVK9jmfYQY5td2gT2sgMqZ',
      },
    ],
    decred: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'DsmiZ8HAj3YVNZKDgu6hTDgcVceRAmda6oX',
      },
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 8,
        expectedAddress: 'DsfVzA6oZxQwHKudLQN8x9c5wzyvhNepcVS',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'DsVwBNvYJeBK6AmwvgAB3s7akkZUdFRPHw1',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 8,
        expectedAddress: 'DsncuE7bKaZ243Z9s8cfDLqqttgihvGjGE5',
      },
    ],
    dogecoin: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'DK9QcSyP3oicQzjgR9BMRM2T6qqckdVn24',
      },
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 3,
        expectedAddress: 'DLyc7kQdpnpAPb5p1dSxCB6onmj6GEPKcX',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'D82ui8uYrDHJ1akWZfijfsJ5QERYRYsKdt',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 3,
        expectedAddress: 'DTCS95bNUH3qXd2fhTNM6UUjK5pmWhLou9',
      },
    ],
    bgold: [
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'AVCg9M2XWXYNRMWKK7RBkAzv9n5NhyVdba',
      },
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 6,
        expectedAddress: 'AXFfsTd8t16bR9QLUzVxVsH4G1RjCEc7xM',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'AbZe6sLD8qVHkHgf2gKn5LcQHhKToBr2Wm',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 6,
        expectedAddress: 'ARQafmqWjDhCN7CcTn82TpyKudZfqNAEwM',
      },
    ],
    litecoin: [
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'MLhJdBy5z1Ja8P1egomxL6xPXosu7HxXak',
      },
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 25,
        expectedAddress: 'MQk8o8qZUH2Ttw8q1rnvkuTULvWLYw5VPW',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'MA3hgbiLDPXG7uhdEddTSxAdpkXYaSN8zd',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 25,
        expectedAddress: 'M9Hr2Ha6iT9yPRCF8GqbQ69i8LJ8zA8oTV',
      },
    ],
    bcash: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'qzncwcuw8usc5f9ugpnukgurwwjqfu48dv4d98mll7',
      },
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 17,
        expectedAddress: 'qqn6jm36yamnrrvlzp2weaau4299lazt9y4auvp08w',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'qpzeef573s9ejumjmjmc9p0k33rk5adnpykvfxkvq9',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 17,
        expectedAddress: 'qrqnwq5xzkdgtx7mqk9l867fpk49hu03yqmstfpfq4',
      },
    ],
    zcash: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 't1eydj7WiYBc3oPgALqu6sbZpejWJ1CrHUq',
      },
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 17,
        expectedAddress: 't1NZLXymx64aKj7SNpH7ndU7vyXQ6qeWPQY',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 't1P3QiFqtpg92DUuT7WH1LRKWLzxsvQ6o1b',
      },
      {
        purpose: 44,
        chainIndex: 1,
        addressIndex: 17,
        expectedAddress: 't1dc8Jun3dHdVV9j4YjayWm9jB1bMwgHfND',
      },
    ],
    digibyte: [
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'SUsmgdcKFtvRURPatutFaZA628LJXrympr',
      },
      {
        purpose: 49,
        chainIndex: 0,
        addressIndex: 5,
        expectedAddress: 'SUkVctVVmSwjeERMBuFMnyP1Qx95yPEXyC',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 0,
        expectedAddress: 'SRQ1GZ7S1LsDE5B7jNjp1MbuNSJpVccXEB',
      },
      {
        purpose: 49,
        chainIndex: 1,
        addressIndex: 5,
        expectedAddress: 'SPfnmxmMVis9nxii7KLsGT36MNE1fN3BPe',
      },
    ],
    stellar: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'GDVCY6Z7OQ26S5CTAMCB7FUDROEUPSILLPYEDCGJ2IYECTUUFBFNIO2V',
      },
    ],
    ethereumclassic: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: '0xB2fdBE30Bae02a871E5E6990dBa0ce196cCf3806',
      },
    ],
    ripple: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: 'rpw6et2Rp9r1FB2opRPGZSfr1MKZdYx3y4',
      },
    ],
    ethereum: [
      {
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
        expectedAddress: '0x3B7097b1bd77E03A4E360b4C82004D55677be4eE',
      },
    ],
  },
}
