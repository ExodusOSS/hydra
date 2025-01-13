module.exports = function(api) {
  const config = {
    presets: [
      '@babel/flow',
      [
        '@babel/env',
        {
          targets: {
            node: '10',
          },
        },
      ],
    ],
    comments: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  }

  if (api.env('production')) {
    config.ignore = ['**/__tests__']
  }

  return config
}
