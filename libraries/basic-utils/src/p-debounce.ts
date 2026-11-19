/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

interface DebounceOptions {
  before?: boolean
}

type AnyFunction = (...args: any[]) => any
type AsyncFunction = (...args: any[]) => Promise<any>

interface DebouncedFunction<T extends AnyFunction> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>
}

const pDebounce = <T extends AnyFunction>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> => {
  if (!Number.isFinite(wait)) {
    throw new TypeError('Expected `wait` to be a finite number')
  }

  let leadingValue: ReturnType<T> | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined
  let resolveList: ((value: ReturnType<T>) => void)[] = []

  return function (this: ThisParameterType<T>, ...arguments_: Parameters<T>) {
    return new Promise<Awaited<ReturnType<T>>>((resolve) => {
      const shouldCallNow = options.before && !timeout

      clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = undefined

        const result = options.before ? leadingValue : fn.apply(this, arguments_)

        for (const resolve of resolveList) {
          resolve(result)
        }

        resolveList = []
      }, wait)

      if (shouldCallNow) {
        leadingValue = fn.apply(this, arguments_)
        resolve(leadingValue!)
      } else {
        resolveList.push(resolve)
      }
    })
  }
}

pDebounce.promise = <T extends AsyncFunction>(function_: T): T => {
  let currentPromise: Promise<ReturnType<T>> | undefined

  return async function (this: ThisParameterType<T>, ...arguments_: Parameters<T>) {
    if (currentPromise) {
      return currentPromise
    }

    try {
      currentPromise = function_.apply(this, arguments_)
      return await currentPromise
    } finally {
      currentPromise = undefined
    }
  } as T
}

export default pDebounce
