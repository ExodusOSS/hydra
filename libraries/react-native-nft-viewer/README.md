# @exodus/react-native-nft-viewer

A react-native webview for displaying an NFT in a safe container.

## Content

- [Installation](#installation)
- [Usage](#usage)

## Installation

### First step(Download)

Run `yarn add @exodus/react-native-nft-viewer`

### Second step(Plugin Installation)

#### Automatic installation

`react-native link @exodus/react-native-nft-viewer`

#### Manual installation

**iOS:**

1. In Xcode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@exodus/react-native-nft-viewer` and add `RNNFTViewer.xcodeproj`
3. In Xcode, in the project navigator, select your project. Add `libRNNFTViewer.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. To fix `'RNNFTViewerView.h' file not found`, you have to select your project → Build Settings → Search Paths → Header Search Paths and add:

   `$(SRCROOT)/../node_modules/@exodus/react-native-nft-viewer/ios`

## Usage

```js
import NFTViewer from "@exodus/react-native-nft-viewer";

const () => (
  <NFTViewer
    html={`<h1>hello</h1>`}
  />
)
```

---

**[MIT Licensed](https://github.com/ExodusMovement/react-native-nft-viewer/blob/master/LICENSE)**
