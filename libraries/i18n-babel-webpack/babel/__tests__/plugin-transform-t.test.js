/* eslint-disable no-template-curly-in-string */

const { transformSync } = require('@babel/core')

const plugin = require('../plugin-transform-t.js')

const createBabelOptions = (pluginOptions) => ({
  filename: '<filename>',
  configFile: false,
  presets: [],
  plugins: [
    '@babel/plugin-syntax-jsx',
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    [plugin, pluginOptions],
  ],
})

const transformCode = (code, { pluginOptions, replace = true } = {}) => {
  const transformed = transformSync(code, createBabelOptions(pluginOptions))

  if (!replace) return transformed.code

  return transformed.code.replaceAll('\n', '').replaceAll('  ', ' ')
}

const expectTransform = ({ code, expected, importLine, preserveVariableNames }) => {
  const _importLine = importLine || `import { t, T } from '@exodus/i18n';`
  const _code = transformCode(`${_importLine}${code}`, { pluginOptions: { preserveVariableNames } })
  const _expected = `${_importLine}${expected};`

  expect(_code).toBe(_expected)
}

describe('i18n babel plugin', () => {
  test('should transform simple <T> component', () => {
    const code = '<T>Test</T>'
    const expected = '<T id={"Test"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> with template string', () => {
    const code = '<T>{`Test`}</T>'
    const expected = '<T id={"Test"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with static string value', () => {
    const code = '<T>Welcome {"back"} again</T>'
    const expected = '<T id={"Welcome back again"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with static decimal numeric value', () => {
    const code = '<T>Welcome {10} again</T>'
    const expected = '<T id={"Welcome 10 again"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with static float numeric value', () => {
    const code = '<T>Welcome {10.3} again</T>'
    const expected = '<T id={"Welcome 10.3 again"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with dynamic value', () => {
    const code = '<T>Welcome {name} back</T>'
    const expected =
      '<T id={"Welcome {name} back"} values={{ "name": {  "value": name,  "positions": [0] }}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with re-used dynamic values', () => {
    const code = '<T>Hey {name}! Welcome back {name}</T>'
    const expected =
      '<T id={"Hey {name}! Welcome back {name}"} values={{ "name": {  "value": name,  "positions": [0, 1] }}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with dynamic value (not preserving names)', () => {
    const code = '<T>Welcome {name} back</T>'
    const expected =
      '<T id={"Welcome {0} back"} values={{ "0": {  "value": name,  "positions": [0] }}} />'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform <T> component with trailing punctuation', () => {
    const code = '<T>Test.</T>'
    const expected = '<T id={"Test"} punctuations={{ "trailing": "."}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with leading punctuation', () => {
    const code = '<T>... test</T>'
    const expected = '<T id={"test"} punctuations={{ "leading": "... "}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with dynamic template string', () => {
    const code = '<T>{`Welcome ${name} back`}</T>'
    const expected =
      '<T id={"Welcome {name} back"} values={{ "name": {  "value": name,  "positions": [0] }}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with dynamic template string (not preserving names)', () => {
    const code = '<T>{`Welcome ${name} back`}</T>'
    const expected =
      '<T id={"Welcome {0} back"} values={{ "0": {  "value": name,  "positions": [0] }}} />'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform <T> component with dynamic nested template string', () => {
    const code = '<T>{`Welcome ${user.name} back`}</T>'
    const expected =
      '<T id={"Welcome {user.name} back"} values={{ "user.name": {  "value": user.name,  "positions": [0] }}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with dynamic nested template string (not preserving names)', () => {
    const code = '<T>{`Welcome ${user.name} back`}</T>'
    const expected =
      '<T id={"Welcome {0} back"} values={{ "0": {  "value": user.name,  "positions": [0] }}} />'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform <T> component with nested dynamic value', () => {
    const code = '<T>Welcome {user.name} back</T>'
    const expected =
      '<T id={"Welcome {user.name} back"} values={{ "user.name": {  "value": user.name,  "positions": [0] }}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with nested dynamic value (not preserving names)', () => {
    const code = '<T>Welcome {user.name} back</T>'
    const expected =
      '<T id={"Welcome {0} back"} values={{ "0": {  "value": user.name,  "positions": [0] }}} />'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform <T> component with nested dynamic value and punctuations', () => {
    const code = '<T>Welcome {user.name} back..</T>'
    const expected =
      '<T id={"Welcome {user.name} back"} values={{ "user.name": {  "value": user.name,  "positions": [0] }}} punctuations={{ "trailing": ".."}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with explicit new line', () => {
    const code = '<T>Welcome {`\n`} back</T>'
    const expected = '<T id={"Welcome \\\\n back"} />'

    expectTransform({ code, expected })
  })

  test('should transform T using import alias', () => {
    const importLine = `import { T as AliasT } from '@exodus/i18n';`
    const code = `<AliasT>Test</AliasT>`
    const expected = `<AliasT id={"Test"} />`

    expectTransform({ code, expected, importLine })
  })

  test('should transform <T> component with multiple lines', () => {
    const code = `
      <T>
        This is a long message
        with multiple lines
      </T>
    `
    const expected = '<T id={"This is a long message with multiple lines"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with explicit new line in multiple lines', () => {
    const code = `
      <T>
        This is a long message
        {\`\n\`}
        with multiple lines
      </T>
    `
    const expected = '<T id={"This is a long message\\\\nwith multiple lines"} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with multiple lines and dynamic value', () => {
    const code = `
      <T>
        This is a long message
        with {linesAmount} lines
        whatever
      </T>
    `
    const expected =
      '<T id={"This is a long message with {linesAmount} lines whatever"} values={{ "linesAmount": {  "value": linesAmount,  "positions": [0] }}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with multiple lines and dynamic value (not preserving values)', () => {
    const code = `
      <T>
        This is a long message
        with {linesAmount} lines
        whatever
      </T>
    `
    const expected =
      '<T id={"This is a long message with {0} lines whatever"} values={{ "0": {  "value": linesAmount,  "positions": [0] }}} />'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform <T> component with JSX elements', () => {
    const code = `
      <T>
        <h1>This is a element </h1>
        this is not
        <p> and this is another</p>
      </T>
    `
    const expected =
      '<T id={"<0>This is a element </0>this is not<1> and this is another</1>"} components={{ "0": <h1></h1>, "1": <p></p>}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with nested JSX elements', () => {
    const code = `
      <T>
        <p>This is a element with a <a>nested element on it</a></p> and this is not
      </T>
    `
    const expected =
      '<T id={"<0>This is a element with a <1>nested element on it</1></0> and this is not"} components={{ "0": <p></p>, "1": <a></a>}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with self closing JSX elements', () => {
    const code = `
      <T>
        This has <p /> self <a /> closing <b /> elements
      </T>
    `
    const expected =
      '<T id={"This has <0 /> self <1 /> closing <2 /> elements"} components={{ "0": <p />, "1": <a />, "2": <b />}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> component with combination of both nested and self closing elements', () => {
    const code = `
      <T>
        This has <p>a combination of</p> elements and <a /> self closing <h1 /> elements
      </T>
    `
    const expected =
      '<T id={"This has <0>a combination of</0> elements and <1 /> self closing <2 /> elements"} components={{ "0": <p></p>, "1": <a />, "2": <h1 />}} />'

    expectTransform({ code, expected })
  })

  test('should transform <T> preserving explicitelly passed id', () => {
    const code = '<T id="welcome-gretting">Welcome back</T>'
    const expected = '<T id={"welcome-gretting"} />'

    expectTransform({ code, expected })
  })

  test('should not transform T if not imported from module', () => {
    const importLine = `import { T, t } from 'other-module';`
    const code = '<T>Test</T>'

    expectTransform({ code, expected: code, importLine })
  })

  test('should transform simple t call', () => {
    const code = "t('Test')"
    const expected = 't("Test")'

    expectTransform({ code, expected })
  })

  test('should transform simple t call with trailing punctuation', () => {
    const code = "t('Test...')"
    const expected = 't("Test", { "punctuations": {  "trailing": "..." }})'

    expectTransform({ code, expected })
  })

  test('should transform simple t call with leading punctuation', () => {
    const code = "t('... test')"
    const expected = 't("test", { "punctuations": {  "leading": "... " }})'

    expectTransform({ code, expected })
  })

  test('should transform t call with template string', () => {
    const code = 't(`Test`)'
    const expected = 't("Test")'

    expectTransform({ code, expected })
  })

  test('should transform t with static string value', () => {
    const code = 't(`Welcome ${"back"} again`)'
    const expected =
      't("Welcome {0} again", { "values": {  "0": {   "value": "back",   "positions": [0]  } }})'

    expectTransform({ code, expected })
  })

  test('should transform t with static decimal numeric value', () => {
    const code = 't(`Welcome ${10} again`)'
    const expected =
      't("Welcome {0} again", { "values": {  "0": {   "value": 10,   "positions": [0]  } }})'

    expectTransform({ code, expected })
  })

  test('should transform t with static float numeric value', () => {
    const code = 't(`Welcome ${10.3} again`)'
    const expected =
      't("Welcome {0} again", { "values": {  "0": {   "value": 10.3,   "positions": [0]  } }})'

    expectTransform({ code, expected })
  })

  test('should transform t call with dynamic value', () => {
    const code = 't(`Welcome ${name} back`)'
    const expected =
      't("Welcome {name} back", { "values": {  "name": {   "value": name,   "positions": [0]  } }})'

    expectTransform({ code, expected })
  })

  test('should transform t call with re-used dynamic values', () => {
    const code = 't(`Hey ${name}! Welcome back ${name}`)'
    const expected =
      't("Hey {name}! Welcome back {name}", { "values": {  "name": {   "value": name,   "positions": [0, 1]  } }})'

    expectTransform({ code, expected })
  })

  test('should transform t call with dynamic value (not preserving values)', () => {
    const code = 't(`Welcome ${name} back`)'
    const expected =
      't("Welcome {0} back", { "values": {  "0": {   "value": name,   "positions": [0]  } }})'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform t call with nested dynamic value', () => {
    const code = 't(`Welcome ${user.name} back`)'
    const expected =
      't("Welcome {user.name} back", { "values": {  "user.name": {   "value": user.name,   "positions": [0]  } }})'

    expectTransform({ code, expected })
  })

  test('should transform t call with nested dynamic value (not preserving values)', () => {
    const code = 't(`Welcome ${user.name} back`)'
    const expected =
      't("Welcome {0} back", { "values": {  "0": {   "value": user.name,   "positions": [0]  } }})'

    expectTransform({ code, expected, preserveVariableNames: false })
  })

  test('should transform t using import alias', () => {
    const importLine = `import { t as aliasT } from '@exodus/i18n';`
    const code = `aliasT('Test')`
    const expected = `aliasT("Test")`

    expectTransform({ code, expected, importLine })
  })

  test('should transform t using hook import', () => {
    const importLine = `import { useI18n } from '@exodus/i18n';const { t} = useI18n();`
    const code = 't(`Get ${rewardPercentage} rewards from each invitation.`)'
    const expected = `t("Get {rewardPercentage} rewards from each invitation", { "values": {  "rewardPercentage": {   "value": rewardPercentage,   "positions": [0]  } }, "punctuations": {  "trailing": "." }})`

    expectTransform({ code, expected, importLine })
  })

  test('should transform t using hook import alias', () => {
    const importLine = `import { useI18n as useLocalization } from '@exodus/i18n';const { t: aliasT} = useLocalization();`
    const code = `aliasT('Test')`
    const expected = `aliasT("Test")`

    expectTransform({ code, expected, importLine })
  })

  test('should not transform t if not imported from module', () => {
    const importLine = `import { T, t } from 'other-module';`
    const code = `t("Test")`

    expectTransform({ code, expected: code, importLine })
  })

  test('should transform an re-exported component', () => {
    const importLine = `import { t, T } from '#/localization';`

    const code = transformCode(`${importLine}<T>Test</T>`, {
      pluginOptions: {
        additionalModules: ['#/localization'],
      },
    })

    expect(code).toBe(`${importLine}<T id={"Test"} />;`)
  })

  test('should transform both lib and re-exported components', () => {
    const importLine = `import { T as AliasT } from '#/localization';import { T } from '@exodus/i18n';`

    const code = transformCode(`${importLine}<><AliasT>Alias</AliasT><T>Test</T></>`, {
      pluginOptions: {
        additionalModules: ['#/localization'],
      },
    })

    expect(code).toBe(`${importLine}<><AliasT id={"Alias"} /><T id={"Test"} /></>;`)
  })

  test('should transform t using hoc decorator', () => {
    const code = transformCode(
      'import { withI18n } from "@exodus/i18n"; \n' +
        'class SomeComponent extends React.PureComponent {' +
        'render() { const { t } = this.props; return <>{t("First\\nSecond")}</> }' +
        '}',
      {
        pluginOptions: {
          hocDecorators: ['withI18n'],
        },
        replace: false,
      }
    )

    expect(code).toEqual(
      `import { withI18n } from "@exodus/i18n";
class SomeComponent extends React.PureComponent {
  render() {
    const {
      t
    } = this.props;
    return <>{t("First\\\\nSecond")}</>;
  }
}`
    )
  })

  test('should ignore unrelated functions when decorator is present', () => {
    const code = transformCode(`
      import { withI18n } from "@exodus/i18n";

      class SomeComponent extends React.PureComponent {
        render() { return <>{['a', 'b'].join(' ').trim()}</> }
      }
    `)

    expect(code).toEqual(
      `import { withI18n } from "@exodus/i18n";class SomeComponent extends React.PureComponent { render() {  return <>{['a', 'b'].join(' ').trim()}</>; }}`
    )
  })

  test('should ignore default imports', () => {
    const importLine = `import localization from '#/localization';`

    const code = transformCode(`${importLine}localization.init();`, {
      pluginOptions: {
        additionalModules: ['#/localization'],
      },
    })

    expect(code).toBe(`${importLine}localization.init();`)
  })

  test('should transform t with context attributes', () => {
    const code = `t('Test', { context: 'context' })`
    const expected = `t("Test", { "context": "context"})`

    expectTransform({ code, expected })
  })

  test('should transform T with context attributes', () => {
    const code = `<T context="context">Test {linesAmount} points</T>`
    const expected = `<T context="context" id={"Test {linesAmount} points"} values={{ "linesAmount": {  "value": linesAmount,  "positions": [0] }}} />`

    expectTransform({ code, expected })
  })

  test('should transform t using hook import', () => {
    const importLine = `import { useI18n } from '@exodus/i18n';const { t} = useI18n();`
    const code =
      't(`Get ${rewardPercentage} rewards from each invitation.`, { context: "reward.alpha" })'
    const expected = `t("Get {rewardPercentage} rewards from each invitation", { "values": {  "rewardPercentage": {   "value": rewardPercentage,   "positions": [0]  } }, "punctuations": {  "trailing": "." }, "context": "reward.alpha"})`

    expectTransform({ code, expected, importLine })
  })
})
