const config = {
  presets: [
    '@babel/flow',
    [
      '@babel/env',
      {
        targets: {
          node: '16',
        },
        loose: true,
      },
    ],
  ],
}

module.exports = config
