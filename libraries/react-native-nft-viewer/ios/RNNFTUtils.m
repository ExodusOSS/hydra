#import "RNNFTUtils.h"
#import <React/RCTBridge.h>
#import <WebKit/WebKit.h>


@implementation RNNFTUtils

- (dispatch_queue_t)methodQueue{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getWebviewDefaultUserAgent:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    WKWebView *webView = [[WKWebView alloc] init];
    UIView *view = UIApplication.sharedApplication.keyWindow.subviews.lastObject;
    [view addSubview:webView];

    [webView evaluateJavaScript:@"navigator.userAgent" completionHandler:^(id __nullable userAgent, NSError * __nullable error) {
        if (error != nil) {
            reject(@"getWebviewDefaultUserAgent", [@"Error getting userAgent: " stringByAppendingString:[error localizedDescription]], error);
        } else {
            resolve(userAgent);
        }
        [webView removeFromSuperview];
    }];
}

@end
