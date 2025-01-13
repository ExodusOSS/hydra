import delay from 'delay'
import ms from 'ms'
import { InteractionManager } from 'react-native'

export function yieldToUI() {
  return Promise.race([
    new Promise((resolve) => InteractionManager.runAfterInteractions(resolve)),
    // hack in case InteractionManager.runAfterInteractions never calls
    delay(ms('0.5s')),
  ])
}

export async function rnDelay(ms) {
  await delay(ms)
  await yieldToUI()
}
