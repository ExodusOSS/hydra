const eventToAction = ({ moduleId, event }) => `EVENT_${moduleId}_${event}`.toUpperCase()

export default eventToAction
