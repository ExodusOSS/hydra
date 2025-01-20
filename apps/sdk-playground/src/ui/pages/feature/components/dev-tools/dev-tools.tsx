// Exported from redux-devtools
import { createDevTools } from '@redux-devtools/core'

// Monitors are separate packages, and you can make a custom one
import { DockMonitor } from '@redux-devtools/dock-monitor'
import { InspectorMonitor } from '@redux-devtools/inspector-monitor'

// createDevTools takes a monitor and produces a DevTools component
const DevTools = createDevTools(
  // Monitors are individually adjustable with props.
  // Consult their repositories to learn about those props.
  // Here, we put LogMonitor inside a DockMonitor.
  // Note: DockMonitor is visible by default.
  <DockMonitor
    defaultPosition="right"
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    defaultIsVisible={false}
  >
    <InspectorMonitor invertTheme={false} />
  </DockMonitor>
)

export default DevTools
