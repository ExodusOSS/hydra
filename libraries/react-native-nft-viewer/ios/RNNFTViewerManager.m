#import "RNNFTViewerManager.h"

#import <React/RCTUIManager.h>
#import <React/RCTDefines.h>
#import "RNNFTViewerView.h"

@implementation RNNFTViewerManager

RCT_EXPORT_MODULE(RNNFTViewer)

- (UIView *)view
{
  RNNFTViewerView *webView = [RNNFTViewerView new];
  return webView;
}

RCT_EXPORT_VIEW_PROPERTY(html, NSString)
RCT_EXPORT_VIEW_PROPERTY(javaScriptEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(hideKeyboardAccessoryView, BOOL)
RCT_EXPORT_VIEW_PROPERTY(keyboardAppearance, UIKeyboardAppearance)

RCT_EXPORT_VIEW_PROPERTY(onMessage, RCTDirectEventBlock)

RCT_EXPORT_METHOD(injectJavaScript:(nonnull NSNumber *)reactTag script:(NSString *)script)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, RNNFTViewerView *> *viewRegistry) {
    RNNFTViewerView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNNFTViewerView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting RNNFTViewerView, got: %@", view);
    } else {
      [view injectJavaScript:script];
    }
  }];
}

@end
