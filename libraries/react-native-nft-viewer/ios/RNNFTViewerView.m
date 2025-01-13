#import "RNNFTViewerView.h"
#import <React/RCTConvert.h>
#import <UIKit/UIKit.h>

#import "objc/runtime.h"

// runtime trick to make WKWebView keyboard adjustments
// see: http://stackoverflow.com/questions/19033292/ios-7-uiwebview-keyboard-issue/19042279#19042279
// see: https://stackoverflow.com/a/47949089
@interface _SwizzleHelperWK : UIView
@property (nonatomic, copy) WKWebView *webView;
@end
@implementation _SwizzleHelperWK
-(id)inputAccessoryView
{
    if (_webView == nil) {
        return nil;
    }

    if ([_webView respondsToSelector:@selector(inputAssistantItem)]) {
        UITextInputAssistantItem *inputAssistantItem = [_webView inputAssistantItem];
        inputAssistantItem.leadingBarButtonGroups = @[];
        inputAssistantItem.trailingBarButtonGroups = @[];
    }

    // Do not return nil there. This causes issues with keyboardAppearance later.
    return [[UIToolbar alloc] init];
}

@end

@interface RNNFTViewerView () <WKScriptMessageHandler>
@property (nonatomic, copy) WKWebView *webView;

@property (nonatomic, copy) RCTDirectEventBlock onMessage;

@end

static NSString *const MessageHandlerName = @"Bridge";

@implementation RNNFTViewerView
{
}

- (void)dealloc{}

/**
 * See https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/DisplayWebContent/Tasks/WebKitAvail.html.
 */
+ (BOOL)dynamicallyLoadWebKitIfAvailable
{
  static BOOL _webkitAvailable=NO;
  static dispatch_once_t onceToken;

  dispatch_once(&onceToken, ^{
    NSBundle *webKitBundle = [NSBundle bundleWithPath:@"/System/Library/Frameworks/WebKit.framework"];
    if (webKitBundle) {
      _webkitAvailable = [webKitBundle load];
    }
  });

  return _webkitAvailable;
}


- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    super.backgroundColor = [UIColor clearColor];
  }
  return self;
}

- (void)didMoveToWindow
{
  if (self.window != nil && _webView == nil) {
    if (![[self class] dynamicallyLoadWebKitIfAvailable]) {
      return;
    };

    WKWebViewConfiguration *wkWebViewConfig = [WKWebViewConfiguration new];
    wkWebViewConfig.userContentController = [WKUserContentController new];
    wkWebViewConfig.allowsInlineMediaPlayback = NO;
    wkWebViewConfig.mediaPlaybackRequiresUserAction = NO;

    WKUserScript *script = [[WKUserScript alloc]
                            initWithSource: [
                                            NSString
                                            stringWithFormat:
                                            @"window.%@ = {"
                                            "  postMessage: function (data) {"
                                            "    window.webkit.messageHandlers.%@.postMessage(String(data));"
                                            "  }"
                                            "};", MessageHandlerName, MessageHandlerName
                                            ]
                            injectionTime:WKUserScriptInjectionTimeAtDocumentStart
                            forMainFrameOnly:YES
                            ];


    wkWebViewConfig.userContentController = [WKUserContentController new];
    [wkWebViewConfig.userContentController addScriptMessageHandler:self name:MessageHandlerName];
    [wkWebViewConfig.userContentController addUserScript:script];

    WKPreferences *prefs = [[WKPreferences alloc]init];
    prefs.javaScriptEnabled = _javaScriptEnabled;

    wkWebViewConfig.preferences = prefs;

    _webView = [[WKWebView alloc] initWithFrame:self.bounds configuration: wkWebViewConfig];
    _webView.scrollView.scrollEnabled = NO;
    _webView.scrollView.pagingEnabled = NO;
    _webView.scrollView.bounces = NO;
    _webView.allowsLinkPreview = NO;
    _webView.allowsBackForwardNavigationGestures = NO;

    _webView.backgroundColor = UIColor.clearColor;
    _webView.scrollView.backgroundColor = UIColor.clearColor;

    if (_hideKeyboardAccessoryView == true || _keyboardAppearance == UIKeyboardAppearanceDark) {
       [self swizzleKeyboard];
    }

    [self addSubview:_webView];
    [self visitSource];
  }
}

- (void)setKeyboardAppearance:(UIKeyboardAppearance)keyboardAppearance {
    _keyboardAppearance = keyboardAppearance;

    [self swizzleKeyboard];
}

- (void)swizzleKeyboard
{
    if (self.webView == nil) return;

    UIView* subview;

    for (UIView* view in self.webView.scrollView.subviews) {
        if ([[view.class description] hasPrefix:@"WKContentView"]) {
            subview = view;
        }
    }

    if (subview == nil) return;

    NSString* name = [NSString stringWithFormat:@"%@_SwizzleHelperWK", subview.class];
    Class newClass = NSClassFromString(name);

    if (newClass == nil)
    {
        newClass = objc_allocateClassPair(subview.class, [name cStringUsingEncoding:NSASCIIStringEncoding], 0);
        if (!newClass) return;

        if (_hideKeyboardAccessoryView == true) {
            Method accessoryMethod = class_getInstanceMethod([_SwizzleHelperWK class], @selector(inputAccessoryView));
            class_addMethod(newClass, @selector(inputAccessoryView), method_getImplementation(accessoryMethod), method_getTypeEncoding(accessoryMethod));
        }

        IMP keyboardAppearanceImp = imp_implementationWithBlock(^(id _s) {
            return _keyboardAppearance;
        });
        class_addMethod(newClass, @selector(keyboardAppearance), keyboardAppearanceImp, "l@:");

        objc_registerClassPair(newClass);
    }

    object_setClass(subview, newClass);
}

- (void)removeFromSuperview
{
    if (_webView) {
        [_webView.configuration.userContentController removeScriptMessageHandlerForName:MessageHandlerName];
        [_webView removeFromSuperview];
        _webView = nil;
    }

    [super removeFromSuperview];
}

-(void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message
{
    if ([message.name isEqualToString:MessageHandlerName]) {
        if (_onMessage) {
            NSDictionary *event = @{
                @"message": message.body
            };
            _onMessage(event);
        }
    }
}

-(void) setHtml:(NSString *)html
{
  if (![html isEqual:_html]) {
    _html = html;
    [self visitSource];
  }
}

- (void)visitSource
{
  NSURL* baseURL = [NSURL URLWithString:@"about:blank"];
  [_webView loadHTMLString:_html baseURL:baseURL];
}

- (void)injectJavaScript:(NSString *)script
{
    [self.webView evaluateJavaScript: script completionHandler: ^(id result, NSError *error) {
        if (error != nil) {
          RCTLogWarn(@"%@", [NSString stringWithFormat:@"Error evaluating injectedJavaScript: This is possibly due to an unsupported return type. Try adding true to the end of your injectedJavaScript string. %@", error]);
        }
      }];
}

- (void)layoutSubviews
{
  [super layoutSubviews];

  // Ensure webview takes the position and dimensions of RNCWKWebView
  _webView.frame = self.bounds;
}

@end
