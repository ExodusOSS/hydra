export class BaseError extends Error {}

export class CircularDependencyError extends BaseError {
  name = 'CircularDependencyError'
  constructor(depStack: string[]) {
    super(`circular dependency: ${depStack.join(' -> ')}`)
  }
}

export class DependencyNotFoundError extends BaseError {
  name = 'DependencyNotFoundError'
  constructor({ id, parentId }: { id: string; parentId?: string }) {
    super(`dependency not found: ${parentId} -> ${id}`)
  }
}

export class AlreadyResolvedError extends BaseError {
  name = 'AlreadyResolvedError'
  constructor(message = "you can't register dependencies after calling resolve()") {
    super(message)
  }
}

export class NotResolvedError extends BaseError {
  name = 'NotResolvedError'
  constructor(
    message = 'you must call resolve() before consuming dependencies from the container'
  ) {
    super(message)
  }
}

export class InvalidDependencyError extends BaseError {
  name = 'InvalidDependencyError'
}

export class ResolveError extends BaseError {
  name = 'ResolveError'
  constructor(message: string, { cause }: { cause?: BaseError[] } = {}) {
    super(message)
    this.cause = cause
  }
}

export class AlreadyRegisteredError extends BaseError {
  name = 'AlreadyRegisteredError'
  constructor(id: string) {
    super(`module with id ${id} has already been registered`)
  }
}
