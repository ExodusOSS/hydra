# @exodus/wild-emitter

Wildcard emitter implementation

## Install

```sh
    yarn add @exodus/wild-emitter
```

## Usage

```js
const emitter = new Emitter()

const handler = ({ type, payload }) => {}

emitter.subscribe(handler)

emitter.emit('avada-kedavra', { author: 'voldemort', target: 'harry' })

emitter.unsubscribe(handler)
```
