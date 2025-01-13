# @exodus/react-text-mask

Based on [text-mask](https://github.com/text-mask/text-mask/tree/master/react)

[Archived fork repo](https://github.com/ExodusMovement/react-text-mask/) (use for history)

## Getting started

First, install it.

```bash
yarn add @exodus/react-text-mask
```

Then, require it and use it.

```js
import React from 'react'
import MaskedInput from 'react-text-mask'

export default () => (
  <div>
    <MaskedInput
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
    />
  </div>
)
```

`<MaskedInput/>` is fully compatible with `<input/>` element. So, you can
pass it CSS classes, a placeholder attribute, or even an `onBlur` handler.

For example, the following works:

```js
<MaskedInput
  mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
  className="form-control"
  placeholder="Enter a phone number"
  guide={false}
  id="my-input-id"
  onBlur={() => {}}
  onChange={() => {}}
/>
```

## Documentation

For more information about the `props` that you can pass to the component, see
the [documentation here](https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md#readme).

## Customize Rendered `<input>` Component

For advanced uses, you can customize the rendering of the resultant `<input>` via a render prop.
This is entirely optional, if no `render` prop is passed, a normal `<input>` is rendered.

For example, to use with styled-components,
[which requires an innerRef](https://www.styled-components.com/docs/advanced#refs):

```js
<MaskedInput
  mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
  placeholder="Enter a phone number"
  id="my-input-id"
  render={(ref, props) => (
    <MyStyledInput innerRef={ref} {...props} />
  )}
/>

const MyStyledInput = styled.input`
  background: papayawhip;
`;
```
