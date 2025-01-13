#import <React/RCTView.h>
#import <React/RCTDefines.h>
#import <WebKit/WebKit.h>

@class RNNFTViewerView;

@interface RNNFTViewerView : RCTView

@property(nonatomic, copy) NSString *html;
@property(nonatomic, assign) BOOL javaScriptEnabled;
@property (nonatomic, assign) BOOL hideKeyboardAccessoryView;
@property (nonatomic, assign) UIKeyboardAppearance keyboardAppearance;

- (void)injectJavaScript:(NSString *_Nullable)script;

@end
