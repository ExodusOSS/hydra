#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { directories, reactNativeVersion } = require('../../utils/context')

const before = `- (instancetype)init
{
  if ((self = [super init])) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(showOnShake)
                                                 name:RCTShowDevMenuNotification
                                               object:nil];
    _extraMenuItems = [NSMutableArray new];

#if TARGET_OS_SIMULATOR || TARGET_OS_MACCATALYST
    RCTKeyCommands *commands = [RCTKeyCommands sharedInstance];
    __weak __typeof(self) weakSelf = self;

    // Toggle debug menu
    [commands registerKeyCommandWithInput:@"d"
                            modifierFlags:UIKeyModifierCommand
                                   action:^(__unused UIKeyCommand *command) {
                                     [weakSelf toggle];
                                   }];

    // Toggle element inspector
    [commands registerKeyCommandWithInput:@"i"
                            modifierFlags:UIKeyModifierCommand
                                   action:^(__unused UIKeyCommand *command) {
                                     [weakSelf.bridge.devSettings toggleElementInspector];
                                   }];

    // Reload in normal mode
    [commands registerKeyCommandWithInput:@"n"
                            modifierFlags:UIKeyModifierCommand
                                   action:^(__unused UIKeyCommand *command) {
                                     [weakSelf.bridge.devSettings setIsDebuggingRemotely:NO];
                                   }];
#endif
  }
  return self;
}`

const after = `- (instancetype)init
{
  if ((self = [super init])) {
    _extraMenuItems = [NSMutableArray new]; // moved before delay so addItem works at all times

    // register the debugger with a 1s delay, so self.bridge.bundleURL is populated
    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1));
    dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
        // prevents threads from registering shortcuts, so the main app can open the dev menu
        if ([[self.bridge.bundleURL absoluteString] containsString:@"index.bundle"]) {
          [[NSNotificationCenter defaultCenter] addObserver:self
                                                  selector:@selector(showOnShake)
                                                      name:RCTShowDevMenuNotification
                                                    object:nil];

#if TARGET_OS_SIMULATOR || TARGET_OS_MACCATALYST
          RCTKeyCommands *commands = [RCTKeyCommands sharedInstance];
          __weak __typeof(self) weakSelf = self;

          // Toggle debug menu
          [commands registerKeyCommandWithInput:@"d"
                                  modifierFlags:UIKeyModifierCommand
                                        action:^(__unused UIKeyCommand *command) {
                                          [weakSelf toggle];
                                        }];

          // Toggle element inspector
          [commands registerKeyCommandWithInput:@"i"
                                  modifierFlags:UIKeyModifierCommand
                                        action:^(__unused UIKeyCommand *command) {
                                          [weakSelf.bridge.devSettings toggleElementInspector];
                                        }];

          // Reload in normal mode
          [commands registerKeyCommandWithInput:@"n"
                                  modifierFlags:UIKeyModifierCommand
                                        action:^(__unused UIKeyCommand *command) {
                                          [weakSelf.bridge.devSettings setIsDebuggingRemotely:NO];
                                        }];

#endif
        }
    });
  }
  return self;
}`

const threadsDisableDevMenu = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken iOS Debugging fix')

  const filePath = path.join(
    directories.nodeModules.prod.absolute,
    'react-native/React/CoreModules/RCTDevMenu.mm'
  )

  const file = fs.readFileSync(filePath, 'utf8')
  if (file.includes(before)) {
    console.log('# Disable threads DevMenu for ios')
    fs.writeFileSync(filePath, file.replace(before, after))
  }
}

threadsDisableDevMenu()
