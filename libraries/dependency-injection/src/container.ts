import {
  AlreadyResolvedError,
  BaseError,
  CircularDependencyError,
  DependencyNotFoundError,
  InvalidDependencyError,
  NotResolvedError,
  ResolveError,
} from './errors.js'
import { CONTAINER_ID, parseDependencyId } from './utils.js'
import Registry from './registry.js'
import type { Logger } from '@exodus/logger'
import type { Definition, InstanceById } from '@exodus/dependency-types'
import type { Entry } from './types.js'

type ConstructorParams = {
  logger: Logger
  injectDependenciesAsPositionalArguments?: boolean
}

export class Container<D extends Definition> {
  readonly #logger: Logger
  readonly #injectDependenciesAsPositionalArguments: boolean
  #registry = new Registry()

  #isResolved = false

  constructor({ logger, injectDependenciesAsPositionalArguments = false }: ConstructorParams) {
    this.#logger = logger
    this.#injectDependenciesAsPositionalArguments = injectDependenciesAsPositionalArguments
  }

  register = <R extends Definition>({
    factory,
    // @ts-expect-error - are we even using this? our definitions require id to be set
    id = factory.id,
    namespace,
    type,
    dependencies = factory.dependencies || [],
    injectDependenciesAsPositionalArguments = this.#injectDependenciesAsPositionalArguments,
    override = false,
    public: isPublic = false,
  }: R): Container<R | D> => {
    if (this.#isResolved) throw new AlreadyResolvedError()

    if (!id) throw new InvalidDependencyError('expected "id"')
    if (typeof factory !== 'function')
      throw new InvalidDependencyError(`expected function "factory" for dependency "${id}"`)

    if (!Array.isArray(dependencies) || dependencies.some((dep) => typeof dep !== 'string')) {
      throw new InvalidDependencyError(`expected string[] "dependencies" for dependency "${id}"`)
    }

    const entry = {
      id,
      namespace,
      type,
      factory,
      dependencies,
      injectDependenciesAsPositionalArguments,
      private: !isPublic,
    } as const satisfies Entry

    this.#registry.set({
      id,
      override,
      entry,
    })

    this.#logger.debug(
      `registered module ${id} with dependencies: ${entry.dependencies.join(', ')}`
    )

    return this as Container<D | R>
  }

  registerMultiple = <R extends Definition>(deps: R[]): Container<D | R> => {
    for (const dep of deps) {
      this.register(dep)
    }

    return this as Container<D | R>
  }

  #ensureResolved = () => {
    if (!this.#isResolved) throw new NotResolvedError()
  }

  resolve = () => {
    if (this.#isResolved) throw new AlreadyResolvedError()

    let resolvingStack: string[] = []
    const errors = []

    const resolveOne = ({
      id,
      optional,
      parentId,
    }: {
      id: string
      optional?: boolean
      parentId?: string
    }) => {
      const config = this.#registry.get(id)
      if (!config) {
        if (optional) return
        throw new DependencyNotFoundError({ id, parentId })
      }

      if (resolvingStack.includes(id)) throw new CircularDependencyError([...resolvingStack, id])

      resolvingStack.push(id)

      const { factory, dependencies: depIds, injectDependenciesAsPositionalArguments } = config
      const depMetadata: { id: string; optional: boolean }[] = depIds.map(parseDependencyId)

      const depInstances = Object.fromEntries(
        depMetadata.map(({ id: depId, optional }) => {
          return [
            depId,
            this.#registry.getInstance({ id: depId, parent: config }) ||
              resolveOne({
                id: depId,
                optional,
                parentId: config.id,
              }),
          ]
        })
      )

      if (!this.#registry.getInstance({ id, parent: config })) {
        const instance = injectDependenciesAsPositionalArguments
          ? factory(...Object.values(depInstances))
          : factory(depInstances)

        if (!instance)
          throw new InvalidDependencyError(`expected factory to return an instance: ${id}`)

        this.#registry.setInstance({ id, instance })
      }

      resolvingStack.pop()

      return this.#registry.getInstance({ id, parent: config })
    }

    for (const { id } of this.#registry.nodes()) {
      try {
        resolveOne({ id })
      } catch (e) {
        resolvingStack = []
        if (e instanceof BaseError) errors.push(e)
        else throw e
      }
    }

    if (errors.length > 0) {
      const uniqueErrors = [...new Set(errors.map((it) => it.message))]
      throw new ResolveError(uniqueErrors.join('\n'), { cause: errors })
    }

    if (resolvingStack.length > 0) {
      throw new ResolveError('expected stack to be empty after resolving all dependencies')
    }

    this.#isResolved = true
  }

  get = <I extends D['id']>(id: I): ReturnType<Extract<D, { id: I }>['factory']> => {
    this.#ensureResolved()

    const instance = this.#registry.getInstance({ id, parent: { id: CONTAINER_ID } })
    if (!instance) throw new DependencyNotFoundError({ id })

    return instance
  }

  getByType = <T extends D['type']>(type: T): InstanceById<Extract<D, { type: T }>> => {
    this.#ensureResolved()

    const deps = [...this.#registry.nodes()]
    const typeDeps = deps.filter((dep) => dep.type === type)
    const entries = typeDeps.map((dep) => [dep.id, dep.instance])

    return Object.fromEntries(entries)
  }

  getAll = (): InstanceById<D> => {
    this.#ensureResolved()

    return Object.fromEntries([...this.#registry.nodes()].map((it) => [it.id, it.instance]))
  }
}

interface EmptyContainer {
  register<D extends Definition>(node: D): Container<D>
  registerMultiple<D extends Definition>(node: D[]): Container<D>
}

const createContainer = (opts: ConstructorParams) => new Container(opts) as EmptyContainer

export default createContainer
