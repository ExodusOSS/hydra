import Verifier from '@exodus/bip322-js/src/__tests__/src/Verifier'

import suite from './integration.suite'

const metadata = {
  applicationName: 'bitcoin',
  models: ['nanos', 'nanosp', 'nanox'], // note: disabled stax because integration test are pain
  appVersions: ['2.1.3'],
}

const fixture = {
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
}

suite('bitcoin', metadata, fixture)
