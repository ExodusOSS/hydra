# SynchronizedTime

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@exodus/synchronized-time.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@exodus/synchronized-time

The purpose of this module is to maintain externally synchronized time and provide
the `now()` function that returns that time.

## Install

```sh
yarn add @exodus/synchronized-time
```

## Usage

```js
import { SynchronizedTime } from '@exodus/synchronized-time'

console.log(SynchronizedTime.now())
```

The module can be used with `Date` like this:

```js
const syncedDate = new Date(SynchronizedTime.now())
or instead of Date.now():
const syncedNow = SynchronizedTime.now()
```
