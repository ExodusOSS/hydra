const eventToAction = ({ moduleId, event }: { moduleId: string; event: string }): string =>
  `EVENT_${moduleId}_${event}`.toUpperCase()

export default eventToAction
