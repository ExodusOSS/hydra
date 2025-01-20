# SDK playground

Welcome to the big beautiful powerful playground.

## Goals

- [x] identify goals
- [ ] education
  - learn how headless works
  - how to use exodus.xyz
  - how to get data e2e to the UI
- [ ] tACKs
  - can tACK changes to SDK features locally
  - testing refactors / PoC's for SDK improvements
- [ ] SDK inspector for inspecting/visualizing:
  - node dependencies (some module depends on some atom), e.g. https://github.com/ExodusMovement/exodus-hydra/pull/7232
    - detect unnecessary coupling
  - feature dependencies (some feature depends on nodes from some other feature)
    - detect unnecessary coupling
  - data flow
  - event tracing:
    - initially just a log
    - future: which calls / atom updates cascade out of wallet.create()
      - you called wallet.create()
        - which called abcAtom.set and xyzAtom.set
        - which called observers a and b
        - which set atoms j and k
        - ...
        - end of propagation
    - after 2030: fake timers + exodus.tick() to control step by step

## Todos

- add back serialization, so people can learn how it works
- add ports between UI and background, because all other clients are multi-process

## Redux DevTools

Keyboard Shortcuts:

- `Ctrl+H` Toggle Visibility
- `Ctrl+Q` Move the Dock Position

## Troubleshooting

### TypeError: memoize is not a function

`rm -rf node_modules/.vite` and try again.
