import * as ethers from '@exodus/ethersproject-transactions'

import Verifier from '../../../../../libraries/bip322-js/test/src/Verifier'

export const fixtures = {
  mnemonic:
    'mobile rapid mule cruel arrest column auto seven behind dance tool erosion rather spike churn lottery tired sleep universe kitchen exhibit job blossom shell',

  bitcoin: {
    xpubs: {
      "m/44'/0'/0'":
        'xpub6C2oiuJX39kNqBDbF5M4ZDFARmwBhkdPL3rhVeMSccmSGoavXoDLjn3sidpShi14Gikv8Kqj5n63rr4FKtExE8WH1q71YvqPrJH4f89j4c5',
      "m/84'/0'/0'":
        'xpub6CmQrTtNJPTEN8HCTasvgVPcVgoXS7nw4R6YjEcYEwPmUdhKJ2DY1aBEWH7DTeMBcdvsMk5xWtQCqxhNRpX4nJrC83G3aZpPN3Pbsw1bYq3',
      "m/86'/0'/0'":
        'xpub6CXd8ZdfKs97HQ9oqWQB4jfAGUqeKYUXZZzNuR5nBo7jvwGUFzatcWm7B8tyh4Vaa1sJuhxaYALbmBp7Yy2qqaDu3ToimiR8ZHEHLRtnghU',
    },
    addresses: {
      "m/44'/0'/0'/0/0": '1PmnHdtMivFTULDuqfbkTpZR98AZSFvCYZ',
      "m/44'/0'/0'/0/1": '12qgU6jze8QHuvbCWdV7jvXPYrdQpmvCcT',
      "m/44'/0'/0'/1/0": '1NgR5uVmPunzwJ6u5RyhwFiLpPy3TCS583',
      "m/44'/0'/1'/0/0": '17cVig8xHLWNuYUXe5rNmjQE1FoATnKwUJ',
      "m/44'/0'/1'/0/1": '14RGdjogB9kQfytU9xo2hnGhcfVqmD5rq6',
      "m/49'/0'/0'/0/1": '3KysjWCvz4VW6p2sAPoQEBUFsCPxWvEF5m',
      "m/49'/0'/0'/0/0": '3QeTcUMbMg3QEUQfjR6XeVUADfJiGVhV22',
      "m/49'/0'/0'/1/0": '3BMjma4pQvRmQ9ZvGxj3eu2b9uaDqbEg5s',
      "m/49'/0'/1'/0/0": '3PNK5TMo3K8Cw5qx2VpaJLtGmSTuHcf8C2',
      "m/49'/0'/1'/0/1": '3PGVJqoUKqx5k4Q1ge5WE7APkc6EufC4FU',
      "m/84'/0'/0'/0/0": 'bc1qwfm5x9dl8hqpff93getkrsmqd9l2mdhhfglnrs',
      "m/84'/0'/0'/0/1": 'bc1qlpx34gxmwp9aukdqj0va2zpv2mj5d6cnm62fsl',
      "m/84'/0'/0'/1/0": 'bc1qg77anwvlah3zcc6j6ed8pncsslflu7ctdnznnl',
      "m/84'/0'/1'/0/0": 'bc1qv4evef74rs3cckyhukvuutzk032e0sfhj8chuw',
      "m/84'/0'/1'/0/1": 'bc1qec6ftp94zdy0ecahfgq8ht4xzkfy64tgmpj8pp',
      "m/86'/0'/0'/0/0": 'bc1plfa6egr94lcda0pmcwn3gh253d5fecd92w7pp6spwrt9xgy4aypqhs29nj',
      "m/86'/0'/0'/0/1": 'bc1p4f7rvggnhn8wwdfaxp5k9n4xhn7hg2umyxqemc8sfx4x8jyrrmgq7zkg3q',
      "m/86'/0'/0'/1/0": 'bc1p9v787288lmqlql5uxnrczeshz43lsy4pwtmaaxsxvf8al485nmus33pwy9',
      "m/86'/0'/1'/0/0": 'bc1pxhjf85zdzqtu45nrzx8f7pukrxqklhgjkedq7ja2jxanykpx7pxq84znfg',
      "m/86'/0'/1'/0/1": 'bc1pk9gxerqu80megemvgzur7tw2tgqad9zwj662943p7q59u6jrzdfqeg87k8',
    },
    publicKeys: {
      "m/44'/0'/0'/0/0": '027f441625156b14d36c247709553c935fe606f5c5013c8de85ea55e0bf65f10b2',
      "m/44'/0'/0'/0/1": '03c422771922ae5654fe2e3e976e18dd033d9c063d2fe0585afa4ca6cfe5346bac',
      "m/44'/0'/0'/1/0": '032795ab958f611e1fba7f9e1a2632be7d2606655b6210afd17a3f9a4908a616b3',
      "m/44'/0'/1'/0/0": '02c5c828e7a9f75dd519031f5b38d834ee2ac35951213535a4079b7a8cdecc4f21',
      "m/44'/0'/1'/0/1": '031300e390ae36a08b7dcf2ed177cfde046e6ac752a5d56396aecd4d49a08ba0e0',
      "m/49'/0'/0'/0/0": '02a18e8d2855d39d2aa87445a4404f6dc214574353b54b949f9651d6da7f6c7310',
      "m/49'/0'/0'/0/1": '03cbe84ac3bbe82cafabbdf95652fc3c65f57b5d20f5ace9615de4d9cfb5174482',
      "m/49'/0'/0'/1/0": '02d33db07087588bf857999c04eaca3776bab8f778f518dddafb578d7a7b424ea9',
      "m/49'/0'/1'/0/0": '03feb3017c4c71ef9b9acd72857648b9a838c63b98577efd50b6c8f1f3b93ef147',
      "m/49'/0'/1'/0/1": '030e2d5ff27900f1fd49b83398fcca8293800ffdc59d7bde1e0cfaead14179f392',
      "m/84'/0'/0'/0/0": '02dfb58125642407d02a4821197ed2ca7a7f8cd9427ac30d2dbce509c837d6dba2',
      "m/84'/0'/0'/0/1": '032c6638ae002a21da34ca94904ef8daa90eeb58e04ff8c3242b1b5846ccc0d812',
      "m/84'/0'/0'/1/0": '035bc73838f45d0fc4d6e14fade075b192fb73ff7fb0a5815e3b6d6fde66940823',
      "m/84'/0'/1'/0/0": '03c9e5cfa579c3f459ea5113bbd1f91c86cfbb450d851578add096afd6f1521855',
      "m/84'/0'/1'/0/1": '039c0fb0cab59f5447497e0283558dedf0d97410474c676df850efaca6c9a3e799',
      "m/86'/0'/0'/0/0": '026c85aae5f51cc0aeaf3994a98f796724c5b912dfe81fc10d3133a1612f6a4eee',
      "m/86'/0'/0'/0/1": '026a404be33e2843947ff41187340dbdf56ad83431c2a9a78004ca3f8fdfe92a93',
      "m/86'/0'/0'/1/0": '0266489da524ef8a290fc530db69e5fdc7304962c81e690cb4d90fc6c5d71a9143',
      "m/86'/0'/1'/0/0": '023fd02be6d4085f47760ea4825906676e9f48cf00c7e5606305ce1cfd5c1e144b',
      "m/86'/0'/1'/0/1": '03e5da845e9f766f2bf7585561a74b32abeb9a2f81c88041220c126cb4a44d5ce0',
    },
    transactions: [
      {
        customApproveNavigation: {
          nanos: ['Approve', 'Accept'],
          nanosp: ['Approve', 'Accept'],
          nanox: ['Approve', 'Accept'],
          stax: ['Hold'],
        },
        params: {
          derivationPaths: ["m/84'/0'/0'/0/0", "m/84'/0'/0'/0/1", "m/84'/0'/0'/1/0"],
          signableTransaction: Buffer.from(
            '70736274ff0102040200000001030400000000010401020105010201fb0402000000000100fd34010200000000010158e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff0480f0fa020000000016001472774315bf3dc014a4b1465761c360697eadb6f780f0fa0200000000160014f84d1aa0db704bde59a093d9d5082c56e546eb1380f0fa0200000000225120fa7baca065aff0debc3bc3a7145d548b689ce1a553bc10ea0170d6532095e90280f0fa0200000000225120aa7c362113bccee7353d306962cea6bcfd742b9b21819de0f049aa63c8831ed002473044022033dff0a30bc724bc4d2869284fe79145f9098728dfb1c41bed3db9b77df99dd902200f756b05a20729e64661833690268fa6925f2d997d36dc7818047be9b9759ad5012102dfb58125642407d02a4821197ed2ca7a7f8cd9427ac30d2dbce509c837d6dba20000000001011f80f0fa020000000016001472774315bf3dc014a4b1465761c360697eadb6f7010e20a5dea3f4e8b99daf2c962151b457f650f85a75ab634207a29a4cc1fcacab310d010f0400000000011004ffffffff000100fd34010200000000010158e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff0480f0fa020000000016001472774315bf3dc014a4b1465761c360697eadb6f780f0fa0200000000160014f84d1aa0db704bde59a093d9d5082c56e546eb1380f0fa0200000000225120fa7baca065aff0debc3bc3a7145d548b689ce1a553bc10ea0170d6532095e90280f0fa0200000000225120aa7c362113bccee7353d306962cea6bcfd742b9b21819de0f049aa63c8831ed002473044022033dff0a30bc724bc4d2869284fe79145f9098728dfb1c41bed3db9b77df99dd902200f756b05a20729e64661833690268fa6925f2d997d36dc7818047be9b9759ad5012102dfb58125642407d02a4821197ed2ca7a7f8cd9427ac30d2dbce509c837d6dba20000000001011f80f0fa0200000000160014f84d1aa0db704bde59a093d9d5082c56e546eb13010e20a5dea3f4e8b99daf2c962151b457f650f85a75ab634207a29a4cc1fcacab310d010f0401000000011004ffffffff0001030870c9fa020000000001041976a914f9cadf838dcf10f4292a8d5735c41d39ebc21e2488ac0001030870c9fa0200000000010416001447bdd9b99fede22c6352d65a70cf1087d3fe7b0b00',
            'hex'
          ),
        },
        result: [
          '3045022100c4c1e3d9515fa589e20439473d9cac4b1236d2a350147a093919627736335cc502207b7746712fc6a8b6c70246324ae023153cba08ec051ab86902a9447c46b60e9801',
          '3045022100f02cca00f9ff7e5527f46add49e27dcbf2ec32eb7178a2b160e9ce882fba90b1022054ff96928bce9fecf38bf28b722edfaae65e46d24b7e9cb6bede82384e343d6601',
        ],
      },
      {
        description: 'PSBT with 2 Taproot/SegwitV1 inputs and two outputs, one change',
        customApproveNavigation: {
          nanos: ['Approve', 'Accept'],
          nanosp: ['Approve', 'Accept'],
          nanox: ['Approve', 'Accept'],
          stax: ['Hold'],
        },
        params: {
          derivationPaths: ["m/86'/0'/0'/0/0", "m/86'/0'/0'/0/1", "m/86'/0'/0'/1/0"],
          signableTransaction: Buffer.from(
            '70736274ff0102040200000001030400000000010401020105010201fb04020000000001012b80f0fa0200000000225120fa7baca065aff0debc3bc3a7145d548b689ce1a553bc10ea0170d6532095e902010e20a5dea3f4e8b99daf2c962151b457f650f85a75ab634207a29a4cc1fcacab310d010f0403000000011004ffffffff0117206c85aae5f51cc0aeaf3994a98f796724c5b912dfe81fc10d3133a1612f6a4eee0001012b80f0fa0200000000225120aa7c362113bccee7353d306962cea6bcfd742b9b21819de0f049aa63c8831ed0010e20a5dea3f4e8b99daf2c962151b457f650f85a75ab634207a29a4cc1fcacab310d010f0404000000011004ffffffff0117206a404be33e2843947ff41187340dbdf56ad83431c2a9a78004ca3f8fdfe92a930001030870c9fa020000000001041976a914f9cadf838dcf10f4292a8d5735c41d39ebc21e2488ac0001030870c9fa020000000001042251202b3c7f28e7fec1f07e9c34c78166171563f812a172f7de9a06624fdfd4f49ef900',
            'hex'
          ),
        },
        result: (signatures) => {
          expect(signatures.length).toBe(2)
          expect(signatures[0].publicKey.toString('hex')).toBe(
            'fa7baca065aff0debc3bc3a7145d548b689ce1a553bc10ea0170d6532095e902'
          )
          expect(signatures[1].publicKey.toString('hex')).toBe(
            'aa7c362113bccee7353d306962cea6bcfd742b9b21819de0f049aa63c8831ed0'
          )
          expect(signatures[0].signature.length).toBe(64)
          expect(signatures[1].signature.length).toBe(64)
        },
      },
      {
        description: 'PSBT with 1 Taproot/SegwitV1 (Ordinal) and 1 SegwitV0 input and one output',
        customApproveNavigation: {
          nanos: ['Continue', 'Approve', 'Accept', 'Continue', 'Continue', 'Approve', 'Accept'],
          nanosp: ['Continue', 'Approve', 'Accept', 'Continue', 'Continue', 'Approve', 'Accept'],
          nanox: ['Continue', 'Approve', 'Accept', 'Continue', 'Continue', 'Approve', 'Accept'],
          stax: ['Hold'],
        },
        params: {
          derivationPaths: ["m/86'/0'/0'/0/0", "m/84'/0'/0'/0/0"],
          signableTransaction: Buffer.from(
            'cHNidP8BAIcCAAAAAqQFUuAWjY3nJAHYjPJ+xme5cYvGN9hwgFlqb8ACVO5wAAAAAAD/////pse4CL1QwNKhs5W60AmiQHguZ6FGmxB8ceHOrLOaFHAKAAAAAP////8BECcAAAAAAAAiUSAB9D5HS2KafYc56h8zYqB5xfI9zUc3tizznjIQjtqAHAAAAAAAAQErECcAAAAAAAAiUSD6e6ygZa/w3rw7w6cUXVSLaJzhpVO8EOoBcNZTIJXpAgABAR9qMQAAAAAAABYAFHJ3QxW/PcAUpLFGV2HDYGl+rbb3AAA=',
            'base64'
          ),
        },
        result: (signatures) => {
          expect(signatures.length).toBe(2)
          expect(signatures[0].publicKey.toString('hex')).toBe(
            'fa7baca065aff0debc3bc3a7145d548b689ce1a553bc10ea0170d6532095e902'
          )
          expect(signatures[1].publicKey.toString('hex')).toBe(
            '02dfb58125642407d02a4821197ed2ca7a7f8cd9427ac30d2dbce509c837d6dba2'
          )
          expect(signatures[0].signature.length).toBe(64)
          expect(signatures[1].signature.length).toBe(72)
        },
      },
      {
        description: 'PSBT with 1 Taproot/SegwitV1 (Ordinal) input with non-default sighash',
        customApproveNavigation: {
          nanos: ['Continue', 'Continue', 'Approve', 'Accept'],
          nanosp: ['Continue', 'Continue', 'Approve', 'Accept'],
          nanox: ['Continue', 'Continue', 'Approve', 'Accept'],
          stax: ['Hold'],
        },
        params: {
          derivationPaths: ["m/86'/0'/0'/0/0"],
          signableTransaction: Buffer.from(
            'cHNidP8BAFICAAAAAcrRAyNMK72s+enC+jRe3U/c9as+lCpTBG8TmJDxF8mUAAAAAAD/////AQJC7gUAAAAAFgAUcndDFb89wBSksUZXYcNgaX6ttvcAAAAAAAEA/RkCAgAAAAABA0F3A5lURgLr6QuPhPIZN8qsXcueZBSM9NCRA3tCBOsWAQAAAAD/////b0lItOKnlPvceQt0XSkcVj7LVP6K1p5k36SUg0IVHM8AAAAAFxYAFFM+7hfqcu3/cpk9X22PM3CIiQ1D/////3miTndMNdXFnBPmQrHbv+HombtOuSDkyRAADzHO0K/qEQAAABcWABRTPu4X6nLt/3KZPV9tjzNwiIkNQ/////8CIgIAAAAAAAAiUSD6e6ygZa/w3rw7w6cUXVSLaJzhpVO8EOoBcNZTIJXpAn4wAAAAAAAAF6kUnI8NWAhSwx22pPO+qLWq8pAyEfaHAUCF6ZMrP1NKLVE4Pl3dqcT2c6ebYBOBHdI0rjoKQi1G16uK5dUW0nX8BLxSy/AVUlbFG1PwWk6UaRk9xdJqwATvAkcwRAIgSuXH0Lww9WRkyLfmVNuGHUZv2veUa8vNDVcJCAi6edUCIB4GoDzA0jBwKycOa6vMBgNMHqivsUESz0vVuMWizbGbASEDc3GDO0cqoOMogzZnP/cZfBiqDS5KycSRv51/w9GjKPYCSDBFAiEAuVT5ez9QB5zuZlCjQuRUGdNaqcgBuZEAtdfy1gwMB4cCIHEMZB5tx1LAKpz7jrO20cerLu86LaGrUhgHYaf/GDkjASEDc3GDO0cqoOMogzZnP/cZfBiqDS5KycSRv51/w9GjKPYAAAAAAQErIgIAAAAAAAAiUSD6e6ygZa/w3rw7w6cUXVSLaJzhpVO8EOoBcNZTIJXpAgEDBIMAAAABFyBsharl9RzArq85lKmPeWckxbkS3+gfwQ0xM6FhL2pO7gAA',
            'base64'
          ),
        },
        result: (signatures) => {
          expect(signatures.length).toBe(1)
          expect(signatures[0].publicKey.toString('hex')).toBe(
            'fa7baca065aff0debc3bc3a7145d548b689ce1a553bc10ea0170d6532095e902'
          )
        },
      },
      {
        description: 'PSBT with 1 p2wpkh input and 1 p2pkh input and two outputs',
        customApproveNavigation: {
          nanos: [
            'Continue',
            'Continue',
            'Approve',
            'Approve',
            'Accept',
            'Continue',
            'Approve',
            'Approve',
            'Accept',
          ],
          nanosp: [
            'Continue',
            'Continue',
            'Approve',
            'Approve',
            'Accept',
            'Continue',
            'Approve',
            'Approve',
            'Accept',
          ],
          nanox: [
            'Continue',
            'Continue',
            'Approve',
            'Approve',
            'Accept',
            'Continue',
            'Approve',
            'Approve',
            'Accept',
          ],
          stax: ['Hold'],
        },
        params: {
          derivationPaths: ["m/84'/0'/1'/0/0", "m/44'/0'/1'/0/0"],
          signableTransaction: Buffer.from(
            'cHNidP8BAJ0CAAAAAn8QqCVNlU5xqdOqOTlw8alI5SwMJ9fro/o1lGOVs1utAAAAAAD/////n08oeco5ldXzQUQ2URp7CC4qmhpqM+v3FB47ZrlgzpMAAAAAAP////8CB8MAAAAAAAAWABRlcsyn1RwjjFiX5ZnOLFZ8VZfBN1rpAAAAAAAAGXapFEiHSVCvZuZWjtFjOldAkWu+RvBciKwAAAAAAAEBH6zZAAAAAAAAFgAUZXLMp9UcI4xYl+WZzixWfFWXwTcAAQDCAgAAAAABAX8QqCVNlU5xqdOqOTlw8alI5SwMJ9fro/o1lGOVs1utAQAAAAD/////AZbYAAAAAAAAGXapFEiHSVCvZuZWjtFjOldAkWu+RvBciKwCRzBEAiAYg2AYRqo+dz/Z3fUEkS4GuoJ7H3HpxteaCa6H5eOxywIgIGWXbexD3oeU1gMQC0xdklg5HVhL3x8yebzr2CgcYzMBIQNLwHvm5ewvD3FyjAMXEfCyN6LTIq3mjcHmGJVugRGH5wAAAAAAAAA=',
            'base64'
          ),
        },
        result: [
          '3045022100bac6927d719a078cb45df0e65fb6df14306f38461c8c88fd8a2f77a4a732881c02200e83f17d88e37c3c28d48a6b4c6413d7958bb0eb5ba7b1fb832b8b551f6ded3201',
          '3045022100dfed40cb6d532a17d2b57937d4d822778bf382fa53b842e6c43b7f2990fad4960220294748f262d7c255d35521f50d900ac7cde1cd8a9a9057c759a0a63cc389be5a01',
        ],
      },
    ],
    messages: [
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Sign'],
          nanox: [1, 'Sign'],
        },
        params: {
          derivationPath: "m/44'/0'/0'/0/0",
          message: {
            rawMessage: Buffer.from('hello world', 'ascii'),
          },
        },
        result:
          '1f81c8db851bfe156029b3cef2476a8c8a124c144b35c9eda2cc268f125d71768f50a00b0e1cf9ed1da2407b144287b97c2bfc3ede84a4ff24fe8ac18309f2eeab',
      },
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Sign'],
          nanox: [1, 'Sign'],
        },
        params: {
          derivationPath: "m/84'/1'/0'/0/8",
          message: {
            rawMessage: Buffer.from('hello world', 'ascii'),
          },
        },
        result:
          '20da3c1c3da53c132999c6a16af4a3a33ea5ebed26570be5d5cb96bbf567801dc2536d4ef7a2b2999e9d198901d3b413ef7f5430201913a81801796d472207789c',
      },
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Sign'],
          nanox: [1, 'Sign'],
        },
        params: {
          derivationPath: "m/86'/0'/0'/0/0",
          message: {
            rawMessage: Buffer.from('hello world', 'ascii'),
          },
        },
        result:
          '204c29f8a43e136f8a5e876ef80e28377a97bd9d2f943a5cc2551763ea273b0d2d37f07e8c5f6a9b14146eb1a9b19ebe893b37b3812fc52f61bdaf13d786a19ac0',
      },
      {
        customApproveNavigation: {
          nanos: ['Continue', 'Approve', 'Accept'],
          nanosp: ['Continue', 'Approve', 'Accept'],
          nanox: ['Continue', 'Approve', 'Accept'],
          stax: ['Hold'],
        },
        params: {
          derivationPath: "m/84'/0'/0'/0/0",
          message: {
            bip322Message: {
              message: Buffer.from('hello world', 'ascii'),
              address: 'bc1qwfm5x9dl8hqpff93getkrsmqd9l2mdhhfglnrs',
            },
          },
        },
        result: (signature) => {
          expect(Buffer.isBuffer(signature)).toBeTruthy()
          expect(
            Verifier.verifySignature(
              'bc1qwfm5x9dl8hqpff93getkrsmqd9l2mdhhfglnrs',
              'hello world',
              signature.toString('base64')
            )
          ).toBeTruthy()
        },
      },
      {
        customApproveNavigation: {
          nanos: ['Approve', 'Accept'],
          nanosp: ['Approve', 'Accept'],
          nanox: ['Approve', 'Accept'],
          stax: ['Hold'],
        },
        params: {
          derivationPath: "m/86'/0'/0'/0/0",
          message: {
            bip322Message: {
              message: Buffer.from('hello world', 'ascii'),
              address: 'bc1plfa6egr94lcda0pmcwn3gh253d5fecd92w7pp6spwrt9xgy4aypqhs29nj',
            },
          },
        },
        result: (signature) => {
          expect(Buffer.isBuffer(signature)).toBeTruthy()
          expect(signature.length).toBe(66)
          expect(signature.slice(0, 2).toString('hex')).toBe('0140')
          expect(
            Verifier.verifySignature(
              'bc1plfa6egr94lcda0pmcwn3gh253d5fecd92w7pp6spwrt9xgy4aypqhs29nj',
              'hello world',
              signature.toString('base64')
            )
          ).toBeTruthy()
        },
      },
    ],
  },
  ethereum: {
    xpubs: {
      "m/44'/60'/0'":
        'xpub661MyMwAqRbcFVCw1rW4N1kU5WjWMmXa9Jrw2gmypboEY9rknZUjjgceBrgnPSQDenpbShs68fmwY12bmXxc2Mmae4XKi79Pv3sYwR6fm59',
    },
    addresses: {
      "m/44'/60'/0'/0/0": '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
      "m/44'/60'/0'/0/1": '0x5Eab80c0E218692b20Af96e1DB3B786936703fcA',
    },
    publicKeys: {
      "m/44'/60'/0'/0/0": '03b8319b0454dcc30bf37e6f6fc60ffefc838f2b7e6a15f6b546b57bc6e2569941',
      "m/44'/60'/0'/0/1": '027f4ee9b9fb0d9759a5a04534036e0f52a4a03cbd9aebdfbb0706a42daa08e246',
    },
    transactions: [
      {
        params: {
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            'e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080',
            'hex'
          ),
        },
        result: [
          '1c841847ec7cd3d0df8ebe80425c3a30a3f186154740e691bc3b9892460186eb45203e8bc54cc7a5892007e28e2503968e43c81b7743ca2f17116864db50a7dd99',
        ],
      },
      {
        params: {
          // UnsignedTx as used by assets
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            ethers
              .serialize({
                nonce: Buffer.from([1]),
                gasPrice: Buffer.from('2c3ce1ec00', 'hex'),
                gasLimit: Buffer.from('01f567', 'hex'),
                to: '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
                value: Buffer.alloc(0),
                data: Buffer.alloc(0),
                chainId: 1,
              })
              .slice(2),
            'hex'
          ),
        },
        result: [
          '25bdb060db3ca92f79b2514453dbf30f6e3962b34c67b8256ede215123c946540f223f6e45fe015ac4062fe1d5f906ca010ac20cb23b3414f7cbe943279fe92204',
        ],
      },
      {
        customApproveNavigation: {
          nanos: ['Accept', 'and send'],
          nanosp: ['Accept'],
          nanox: ['Accept'],
          stax: ['Hold'],
        },
        params: {
          // ERC-721 / NFT Transfer
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            'f88a0a852c3ce1ec008301f5679460f80121c31a0d46b5279700f9df786054aa5ee580b86442842e0e0000000000000000000000006cbcd73cd8e8a42844662f0a0e76d7f79afd933d000000000000000000000000c2907efcce4011c491bbeda8a0fa63ba7aab596c0000000000000000000000000000000000000000000000000000000000112999018080',
            'hex'
          ),
        },
        result: [
          '26ff5ef99a93d8113f21e958531cc219e04dfc29f9d3f2958fc553f0acecbbd2ee576e51f1efff71c7546cf82c6728249ff2cdb6a145062784cfb48a194fc4d4c8',
        ],
      },
      {
        customApproveNavigation: {
          nanos: ['Accept'],
          nanosp: ['Accept'],
          nanox: ['Accept'],
          stax: ['Hold'],
        },
        params: {
          // ERC-20 / Token Transfer
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            'f869468506a8b15e0082ebeb946b175474e89094c44da98b954eedeac495271d0f80b844095ea7b30000000000000000000000007d2768de32b0b80b7a3454c06bdac94a69ddc7a9ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018080',
            'hex'
          ),
        },
        result: [
          '2618441a7bd60cbe5a4f3f1a941509cb94488476978c79789a6ab1e2e410ff54645bf4740d6a5e6c56ac2ce860babac3e78676a760363ffbee95a715d38256c073',
        ],
      },
      {
        params: {
          // MATIC transactions should be supported by Ethereum app
          assetName: 'matic',
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            ethers
              .serialize({
                nonce: Buffer.from([1]),
                gasPrice: Buffer.from('2c3ce1ec00', 'hex'),
                gasLimit: Buffer.from('01f567', 'hex'),
                to: '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
                value: Buffer.alloc(0),
                data: Buffer.alloc(0),
                chainId: 137,
              })
              .slice(2),
            'hex'
          ),
        },
        result: [
          '013611e884bfe60952ae1efe107e0a7be021bf63698da76fee6958bba3da32e948530a19079bd7dc33664e200fd9f597edf0fdeeed7dc190d5820ceef32bf064d260',
        ],
      },
    ],
    messages: [
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Sign'],
          nanox: [1, 'Sign'],
          stax: ['Hold'],
        },
        params: {
          derivationPath: "m/44'/60'/0'/0/0",
          message: {
            rawMessage: Buffer.from('hellow world', 'ascii'),
          },
        },
        result:
          'a2cc60741514894a18b10be537f97b9cb8c93de887c97857de27f6736b19a39d749a8565b0073b151bf50ec426aae0a075ba45c80184c8e2220a422ed6e22e6d1b',
      },
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Approve'],
          nanox: [1, 'Approve'],
          stax: ['Hold'],
        },
        params: {
          derivationPath: "m/44'/60'/0'/0/0",
          message: {
            EIP712Message: {
              domain: {
                chainId: 5,
                name: 'Ether Mail',
                verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                version: '1',
              },
              message: {
                contents: 'Hello, Bob!',
                from: {
                  name: 'Cow',
                  wallets: [
                    '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
                    '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
                  ],
                },
                to: {
                  name: 'Bob',
                  wallets: [
                    '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                    '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                    '0xB0B0b0b0b0b0B000000000000000000000000000',
                  ],
                },
              },
              primaryType: 'Mail',
              types: {
                EIP712Domain: [
                  { name: 'name', type: 'string' },
                  { name: 'version', type: 'string' },
                  { name: 'chainId', type: 'uint256' },
                  { name: 'verifyingContract', type: 'address' },
                ],
                Mail: [
                  { name: 'from', type: 'Person' },
                  { name: 'to', type: 'Person' },
                  { name: 'contents', type: 'string' },
                ],
                Person: [
                  { name: 'name', type: 'string' },
                  { name: 'wallets', type: 'address[]' },
                ],
              },
            },
          },
        },
        result:
          'e2dff536e633965a27021165cb929fdb2dd47d58414a5cf7f7a337b726d23cc75593715efa94eb48f24e3fe0877ecc33a54dab2893eabb8f0685c66afc62143a1c',
      },
    ],
  },
  matic: {
    addresses: {
      "m/44'/60'/0'/0/0": '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
      "m/44'/60'/0'/0/1": '0x5Eab80c0E218692b20Af96e1DB3B786936703fcA',
    },
    publicKeys: {
      "m/44'/60'/0'/0/0": '03b8319b0454dcc30bf37e6f6fc60ffefc838f2b7e6a15f6b546b57bc6e2569941',
      "m/44'/60'/0'/0/1": '027f4ee9b9fb0d9759a5a04534036e0f52a4a03cbd9aebdfbb0706a42daa08e246',
    },
    transactions: [
      {
        params: {
          // UnsignedTx as used by assets
          assetName: 'matic',
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            ethers
              .serialize({
                nonce: Buffer.from([1]),
                gasPrice: Buffer.from('2c3ce1ec00', 'hex'),
                gasLimit: Buffer.from('01f567', 'hex'),
                to: '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
                value: Buffer.alloc(0),
                data: Buffer.alloc(0),
                chainId: 137,
              })
              .slice(2),
            'hex'
          ),
        },
        result: [
          '013611e884bfe60952ae1efe107e0a7be021bf63698da76fee6958bba3da32e948530a19079bd7dc33664e200fd9f597edf0fdeeed7dc190d5820ceef32bf064d260',
        ],
      },
    ],
  },
  basemainnet: {
    xpubs: {
      "m/44'/60'/0'":
        'xpub661MyMwAqRbcFVCw1rW4N1kU5WjWMmXa9Jrw2gmypboEY9rknZUjjgceBrgnPSQDenpbShs68fmwY12bmXxc2Mmae4XKi79Pv3sYwR6fm59',
    },
    addresses: {
      "m/44'/60'/0'/0/0": '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
      "m/44'/60'/0'/0/1": '0x5Eab80c0E218692b20Af96e1DB3B786936703fcA',
    },
    publicKeys: {
      "m/44'/60'/0'/0/0": '03b8319b0454dcc30bf37e6f6fc60ffefc838f2b7e6a15f6b546b57bc6e2569941',
      "m/44'/60'/0'/0/1": '027f4ee9b9fb0d9759a5a04534036e0f52a4a03cbd9aebdfbb0706a42daa08e246',
    },
    transactions: [
      {
        params: {
          assetName: 'basemainnet',
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            'e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080',
            'hex'
          ),
        },
        result: [
          '422d2ac0da8e5a935aa1a4e02603910712984fde6cb4bbcb16f5727145bca3cf6a8c35f2a028efeacacff4ce0e7917eb20a980da58e1473d9abe152e77c9055b48ff',
        ],
      },
      {
        params: {
          // UnsignedTx as used by assets
          assetName: 'basemainnet',
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            ethers
              .serialize({
                nonce: Buffer.from([1]),
                gasPrice: Buffer.from('2c3ce1ec00', 'hex'),
                gasLimit: Buffer.from('01f567', 'hex'),
                to: '0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c',
                value: Buffer.alloc(0),
                data: Buffer.alloc(0),
                chainId: 8453,
              })
              .slice(2),
            'hex'
          ),
        },
        result: [
          '422dc4b55e512a912672106e4037e92e98a99891adf8913fb8486dcd9b95705260d07468919e72c0d31d60572a7954188ca9a5b0e834da7e5c4b6cbf9689ce074d3b',
        ],
      },
      {
        customApproveNavigation: {
          nanos: ['Accept', 'and send'],
          nanosp: ['Accept', 'and send'],
          nanox: ['Accept', 'and send'],
          stax: ['Hold'],
        },
        params: {
          // ERC-721 / NFT Transfer
          assetName: 'basemainnet',
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            'f88a0a852c3ce1ec008301f5679460f80121c31a0d46b5279700f9df786054aa5ee580b86442842e0e0000000000000000000000006cbcd73cd8e8a42844662f0a0e76d7f79afd933d000000000000000000000000c2907efcce4011c491bbeda8a0fa63ba7aab596c0000000000000000000000000000000000000000000000000000000000112999018080',
            'hex'
          ),
        },
        result: [
          '422ebb5bf2f2896172384d950840b988950521a28e8fee0b26151fe2d286ce80d7fd058de765470b2847339837200cf9089c4f64dda2cdf7dd24586154edcc1d20df',
        ],
      },
      {
        customApproveNavigation: {
          nanos: ['Accept', 'and send'],
          nanosp: ['Accept', 'and send'],
          nanox: ['Accept', 'and send'],
          stax: ['Hold'],
        },
        params: {
          // ERC-20 / Token Transfer
          assetName: 'basemainnet',
          derivationPaths: ["m/44'/60'/0'/0/0"],
          signableTransaction: Buffer.from(
            'f869468506a8b15e0082ebeb946b175474e89094c44da98b954eedeac495271d0f80b844095ea7b30000000000000000000000007d2768de32b0b80b7a3454c06bdac94a69ddc7a9ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018080',
            'hex'
          ),
        },
        result: [
          '422e5b041fc1f4089affae3856ce881ee9d9aad8dc7b1d3a332782cad780c10888461260fcf141295f8becbce290e0e22bdd305a017cf355f0673eaf4f9b27ead35b',
        ],
      },
    ],
    messages: [
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Sign'],
          nanox: [1, 'Sign'],
          stax: ['Hold'],
        },
        params: {
          derivationPath: "m/44'/60'/0'/0/0",
          message: {
            rawMessage: Buffer.from('hellow world', 'ascii'),
          },
        },
        result:
          'a2cc60741514894a18b10be537f97b9cb8c93de887c97857de27f6736b19a39d749a8565b0073b151bf50ec426aae0a075ba45c80184c8e2220a422ed6e22e6d1b',
      },
      {
        customApproveNavigation: {
          nanos: [1, 'Sign'],
          nanosp: [1, 'Approve'],
          nanox: [1, 'Approve'],
          stax: ['Hold'],
        },
        params: {
          derivationPath: "m/44'/60'/0'/0/0",
          message: {
            EIP712Message: {
              domain: {
                chainId: 5,
                name: 'Ether Mail',
                verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                version: '1',
              },
              message: {
                contents: 'Hello, Bob!',
                from: {
                  name: 'Cow',
                  wallets: [
                    '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
                    '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
                  ],
                },
                to: {
                  name: 'Bob',
                  wallets: [
                    '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                    '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                    '0xB0B0b0b0b0b0B000000000000000000000000000',
                  ],
                },
              },
              primaryType: 'Mail',
              types: {
                EIP712Domain: [
                  { name: 'name', type: 'string' },
                  { name: 'version', type: 'string' },
                  { name: 'chainId', type: 'uint256' },
                  { name: 'verifyingContract', type: 'address' },
                ],
                Mail: [
                  { name: 'from', type: 'Person' },
                  { name: 'to', type: 'Person' },
                  { name: 'contents', type: 'string' },
                ],
                Person: [
                  { name: 'name', type: 'string' },
                  { name: 'wallets', type: 'address[]' },
                ],
              },
            },
          },
        },
        result:
          'e2dff536e633965a27021165cb929fdb2dd47d58414a5cf7f7a337b726d23cc75593715efa94eb48f24e3fe0877ecc33a54dab2893eabb8f0685c66afc62143a1c',
      },
    ],
  },
  solana: {
    addresses: {
      "m/44'/501'/0'": 'A5qAhuHsx3FveB2CspArSuZ4gVHKDbZHmg38aCHYF1Ju',
      "m/44'/501'/0'/0'": 'J1f64RSxJdjduvDXuxL1BsJrJaHkw5sUEBUaRMCwphCM', // Magic Eden main account
      // "m/44'/501'/0'/1'": '9Bob6nko61ipmcEwVP9veSB4UJa8a9o96WUpP5P6D59j', // TODO: MagicEden bidding account, can't figure out the path
    },
    publicKeys: {
      "m/44'/501'/0'": '86f5f7f2c7e98ba2d5ed1e68d585d976e3fc020cbab2b3e04cdd5fe85369576e',
      "m/44'/501'/0'/0'": 'fcc1be3c6bcba958beface88582228c967e5a3b4cd3bbf27978154366f00c4ca',
    },
    transactions: [
      {
        params: {
          derivationPaths: ["m/44'/501'/0'"],
          signableTransaction: Buffer.from(
            '0100010286f5f7f2c7e98ba2d5ed1e68d585d976e3fc020cbab2b3e04cdd5fe85369576e0000000000000000000000000000000000000000000000000000000000000000030303030303030303030303030303030303030303030303030303030303030301010200000c020000008096980000000000',
            'hex'
          ),
        },
        result: [
          'ead52bd23809155933ad1cf8ff16622ace8e53c4aa06e02f32c7b14cecb73f0e7e4fc310f7d9f4a7adf360d78363cf8d1d6c762b16f8ce936ff30c562a9c7500',
        ],
      },
    ],
    messages: [
      {
        params: {
          derivationPath: "m/44'/501'/0'",
          message: {
            rawMessage: Buffer.from(
              'ff736f6c616e61206f6666636861696e00000b0068656c6c6f20776f726c64',
              'hex'
            ),
          },
        },
        result:
          '6f86880d892bbcd2133db40456fa361def53313a3e0a23b25a6dcbe6038e209454f256bdbdaf781bc6bf7daeb2276baafd8ad1410926e77fb11c8a9e3e92e40d',
      },
      {
        params: {
          derivationPath: "m/44'/501'/0'",
          message: {
            rawMessage: Buffer.from(
              'ff736f6c616e61206f6666636861696e00010b0068656c6c6f20776f726c64',
              'hex'
            ),
          },
        },
        result:
          'ec1b9e8e792bb2fbfd89eb26e88189b167e82827082e528b3a67a6b67748e255c1fe28deab526427b6e621426cc583089d01575327923ca3eab77f7abccd3b0c',
      },
    ],
  },
  tronmainnet: {
    addresses: {
      "m/44'/195'/0'/0/0": 'TWaSoh8NeP4rRgHDm9mRxWaw6EHhMtGFg5',
      "m/44'/195'/1'/0/0": 'TBTzgqdknctu9yDQkoygQ7eqhZQC1BcRq8',
    },
    publicKeys: {
      "m/44'/195'/0'/0/0": '028454c50d836bde969492d00d7278d80a649c01379d3e69aa2bab6b92ff5ae1a8',
      "m/44'/195'/1'/0/0": '030ba6ec3627a0ae1db8536c801523b4a3ce1254d782ee7a0ab2f31e5278d032d4',
    },
    transactions: [
      {
        customApproveNavigation: {
          nanos: ['Sign'],
          nanosp: ['Sign'],
          nanox: ['Sign'],
          stax: ['Hold'],
        },
        params: {
          derivationPaths: ["m/44'/195'/0'/0/0"],
          signableTransaction: Buffer.from(
            '0a02ff542208a1a1014aebaabaa740c0b4dcc2ad325a68080112640a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412330a1541e20c98eca71c536186364b6b06cb8810ceea223b1215411069e8cb896fe26a523c2ca0162d24c44569e50d189bc9c20e70c4febbc2ad32',
            'hex'
          ),
        },
        result: [
          '0dcc778b0729a278d7e87610c331bd148492d2c78905c34c8215a3d8ba96eef644f5fbbcafdc2b9f8457a1c40f7e98e86d12745e1f3225ddb8dbae091c7fcadc01',
        ],
      },
    ],
    messages: [],
  },
}
