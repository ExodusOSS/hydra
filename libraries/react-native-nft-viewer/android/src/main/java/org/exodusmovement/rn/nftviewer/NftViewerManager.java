package org.exodusmovement.rn.nftviewer;

import android.content.Context;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.webkit.WebMessage;
import android.webkit.WebMessagePort;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.Map;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class NftViewerManager extends SimpleViewManager<WebView> {
  public static final String REACT_CLASS = "RNNFTViewer";

  protected static final String BLANK_URL = "about:blank";
  protected static final String HTML_ENCODING = "UTF-8";
  protected static final String HTML_MIME_TYPE = "text/html";
  protected static final String BASE_URL = "https://exodus.com";

  public static final int COMMAND_INJECT_JAVASCRIPT = 6;

  ReactApplicationContext mCallerContext;

  class RNWebView extends WebView {
    public void onMessage(String message) {
      WritableMap event = Arguments.createMap();
      event.putString("message", message);
      ReactContext reactContext = (ReactContext)getContext();
      reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
              getId(),
              "onMessage",
              event);
    }

    public RNWebView(@NonNull Context context) {
      super(context);
    }
  }

  public NftViewerManager(ReactApplicationContext reactContext) {
    mCallerContext = reactContext;
  }

  @Override
  protected RNWebView createViewInstance(ThemedReactContext context) {
    final RNWebView webView = new RNWebView(context);

    webView.setWebViewClient(new WebViewClient() {
      @Override
      public void onPageFinished(WebView view, String url) {
        WebMessagePort[] channel = view.createWebMessageChannel();
        WebMessagePort port = channel[0];
        port.setWebMessageCallback(new WebMessagePort.WebMessageCallback() {
          @Override
          public void onMessage(WebMessagePort port, WebMessage message) {
            webView.onMessage(message.getData());
          }
        });

        view.postWebMessage(new WebMessage("", new WebMessagePort[]{channel[1]}),
                Uri.parse(BASE_URL));
      }
    });

    webView.setVerticalScrollBarEnabled(false);
    webView.setHorizontalScrollBarEnabled(false);

    return webView;
  }

  @ReactProp(name = "html")
  public void setHtml(WebView view, @Nullable String html) {
    if (html == null) {
      view.loadUrl(BLANK_URL);
      return;
    }

    view.loadDataWithBaseURL(BASE_URL, html, HTML_MIME_TYPE, HTML_ENCODING, null);
  }

  @ReactProp(name = "javaScriptEnabled", defaultBoolean = false)
  public void setJavaScriptEnabled(WebView view, boolean enabled) {
    view.getSettings().setJavaScriptEnabled(enabled);
  }

  @Nullable
  @Override
  public Map<String, Integer> getCommandsMap() {
    return MapBuilder.<String, Integer>builder()
            .put("injectJavaScript", COMMAND_INJECT_JAVASCRIPT)
            .build();
  }

  @Override
  public void receiveCommand(@Nonnull WebView root, int commandId, @Nullable ReadableArray args) {
    if (commandId == COMMAND_INJECT_JAVASCRIPT) {
      root.evaluateJavascript(args.getString(0), null);
    }
  }

  @Nullable
  @Override
  public Map getExportedCustomBubblingEventTypeConstants() {
    return MapBuilder.builder()
            .put(
                    "onMessage",
                    MapBuilder.of(
                            "phasedRegistrationNames",
                            MapBuilder.of("bubbled", "onMessage")))
            .build();
  }

  @Nonnull
  @Override
  public String getName() {
    return REACT_CLASS;
  }
}
