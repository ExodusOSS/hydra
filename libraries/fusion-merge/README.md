# @exodus/fusion-merge

Custom merge algorithm for fusion.

This doesn't create a clone for mismatching entries, it reuses existing ones where possible. Unlike merge-deep, e.g. arrays are not merged, this replaces arrays.

This works only on JSON-compatible plain objects. Other objects will be replaced, not merged.

Empty object keys replace existing object keys:

```js
merge({ foo: { bar: 0 } }, { foo: {} })
// => { foo: {} }
```
