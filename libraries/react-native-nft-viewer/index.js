'use strict'

import React from 'react'
import { requireNativeComponent, NativeModules, UIManager, findNodeHandle } from 'react-native'

const componentName = 'RNNFTViewer'

const RNNFTViewerBase = requireNativeComponent(componentName)

export const RNNFTUtils = NativeModules.RNNFTUtils

export default class RNNFTViewer extends React.Component {
  webViewRef = React.createRef()

  _onMessage = (event) => {
    if (!this.props.onMessage) return

    this.props.onMessage(event.nativeEvent.message)
  }

  getCommands = () => UIManager.getViewManagerConfig(componentName).Commands

  getWebViewHandle = () => {
    return findNodeHandle(this.webViewRef.current)
  }

  injectJavaScript = (data) => {
    UIManager.dispatchViewManagerCommand(
      this.getWebViewHandle(),
      this.getCommands().injectJavaScript,
      [data]
    )
  }

  render() {
    return <RNNFTViewerBase ref={this.webViewRef} {...this.props} onMessage={this._onMessage} />
  }
}
