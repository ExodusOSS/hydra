type EventHandler<E extends string, P> = (params: {
  type: E
  payload: P
}) => PromiseLike<void> | void

export default class Emitter<E extends string = string, P = any> {
  emit(type: E, payload?: P): void
  subscribe(handler: EventHandler<E, P>): void
  unsubscribe(handler: EventHandler<E, P>): void
}
