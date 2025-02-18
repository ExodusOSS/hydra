import { resolve } from 'path'

import extractFiles from '../../extract/extractor.js'

const __dirname = import.meta.dirname

const babelrc = {
  presets: ['@babel/preset-react'],
  plugins: [['@babel/plugin-proposal-decorators', { version: 'legacy' }]],
}

const SCENARIOS = [
  {
    description: 'T component',
    file: './fixtures/jsx.js',
    expect: [
      {
        id: '“Why Spiders? Why Couldn’t It Be Follow The Butterflies?” - Ron Weasley',
        reference: 'fixtures/jsx.js:7',
      },
    ],
  },
  {
    description: 'T component with punctuation',
    file: './fixtures/jsx-punctuations.js',
    expect: [
      {
        id: 'Wingardium Leviosa',
        reference: 'fixtures/jsx-punctuations.js:7',
      },
    ],
  },
  {
    description: 't from hook',
    file: './fixtures/hook.js',
    expect: [{ id: '"Yer a wizard Harry." ― Rubeus Hagrid', reference: 'fixtures/hook.js:7' }],
  },
  {
    description: 't from hook with punctuation',
    file: './fixtures/hook-punctuations.js',
    expect: [{ id: 'Wingardium Leviosa', reference: 'fixtures/hook-punctuations.js:7' }],
  },
  {
    description: 't import',
    file: './fixtures/t-call.js',
    expect: [
      {
        id: '"Rememberall reminder: I lost it. Irony is a curse" - Neville Longbottom',
        reference: 'fixtures/t-call.js:3',
      },
    ],
  },
  {
    description: 't import (cjs)',
    file: './fixtures/t-call.cjs',
    expect: [
      {
        id: '“He’s Back, He’s Back! Voldemort Is Back!” - Harry Potter',
        reference: 'fixtures/t-call.cjs:3',
      },
    ],
  },
  {
    description: 't call in jsx (cjs)',
    file: './fixtures/t-call-in-jsx.cjs',
    expect: [
      {
        id: '“He’s Back, He’s Back! Voldemort Is Back!” - Harry Potter',
        reference: 'fixtures/t-call-in-jsx.cjs:4',
      },
    ],
  },
  {
    description: 'everything, everywhere, all at once',
    file: './fixtures/everything.js',
    expect: [
      { id: 'Harry Potter books', reference: 'fixtures/everything.js:22' },
      { id: "Philosopher's Stone", reference: 'fixtures/everything.js:8' },
      { id: 'Chamber of Secrets', reference: 'fixtures/everything.js:9' },
      { id: 'You were sorted in {0}', reference: 'fixtures/everything.js:17' },
    ],
  },
  {
    description: 'T re-exported from a module',
    file: './fixtures/re-export.js',
    additionalModules: ['#/localization'],
    expect: [
      {
        id: 'Harry Potter',
        reference: 'fixtures/re-export.js:7',
      },
    ],
  },
  {
    description: 't call inside hoc via decorator',
    file: './fixtures/decorator.js',
    hocDecorators: ['withI18n'],
    additionalModules: ['./dependencies/with-i18n.js'],
    expect: [
      {
        id: 'Prefixed with {prefix}',
        reference: 'fixtures/decorator.js:13',
      },
      {
        id: 'Prefixed with “{prefix}”',
        reference: 'fixtures/decorator.js:15',
      },
    ],
  },
  {
    description: 't call with newline and escape it inside hoc via decorator',
    file: './fixtures/decorator-newline.js',
    hocDecorators: ['withI18n'],
    additionalModules: ['./dependencies/with-i18n.js'],
    expect: [
      {
        id: 'First line\\nSecond line',
        reference: 'fixtures/decorator-newline.js:7',
      },
    ],
  },
]

describe('extractor', () => {
  test.each(SCENARIOS)('should extract $description', (scenario) => {
    const fileNames = [resolve(__dirname, scenario.file)]
    const entries = extractFiles(fileNames, {
      rootDir: __dirname,
      babelrc,
      additionalModules: scenario.additionalModules,
      hocDecorators: scenario.hocDecorators,
    })

    expect(entries).toEqual(scenario.expect)
  })

  test('should extract multiple files', () => {
    const fileNames = SCENARIOS.map((scenario) => resolve(__dirname, scenario.file))
    const entries = SCENARIOS.reduce((acc, scenario) => [...acc, ...scenario.expect], [])

    expect(
      extractFiles(fileNames, {
        rootDir: __dirname,
        babelrc,
        additionalModules: ['#/localization', './dependencies/with-i18n.js'],
        hocDecorators: ['withI18n'],
      })
    ).toEqual(entries)
  })
})
