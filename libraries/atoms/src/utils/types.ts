export type Unsubscribe = () => void

export type Listener<T> = (value: T) => Promise<void> | void
export type ResettableListener<T> = Listener<T> & { resetCallState: () => void }

export interface EventEmitter {
  on<T>(event: string, listener: Listener<T>): void
  removeListener<T>(event: string, listener: Listener<T>): void
}

export type Setter<T> = (prev: T) => T | Promise<T>

export interface Atom<T> {
  get(): Promise<T>
  set(value: T): Promise<void>
  set(setter: Setter<T>): Promise<void>
  observe(listener: Listener<T>): Unsubscribe
  reset(): Promise<void>
}

export type ReadonlyAtom<T> = Omit<Atom<T>, 'set' | 'reset'>

export type KeystoreValue = string | number

export interface Port<T> {
  emit(event: string, value: T): void
}

export interface Keystore {
  getSecret(key: string, options?: object): Promise<KeystoreValue>
  setSecret(key: string, value: KeystoreValue, options?: object): Promise<void>
  deleteSecret(key: string, options?: object): Promise<string>
}

export type Logger = Pick<Console, 'trace' | 'debug' | 'error' | 'info' | 'log' | 'warn'>
