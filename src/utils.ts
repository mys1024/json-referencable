import type { Referencified } from './types'

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

export function isObject(val: unknown): val is object {
  return typeof val === 'object'
}

export function isArrOrObj(val: unknown): val is object | unknown[] {
  return isArray(val) || isObject(val)
}

export function isReferencified(val: any): val is Referencified {
  return isObject(val?.refs) && typeof val?.root === 'string'
}

export function shallowClone<T extends object | unknown[]>(data: T): T {
  if (!isArrOrObj(data))
    throw new Error('not an array or object')
  else if (isArray(data))
    return [...data] as T
  else
    return {...data}
}

export function deepClone<T extends object | unknown[]>(data: T): T {
  if (!isArrOrObj(data))
    throw new Error('not an array or object')

  const clones: Map<object | unknown[], object | unknown[]> = new Map()

  const dfs = (d: object | unknown[]) => {
    for (const key in d) {
      const val = d[key]
      if (!isArrOrObj(val))
        continue
      let clone = clones.get(val)
      if (clone === undefined) {
        clone = shallowClone(val)
        clones.set(val, clone)
        dfs(clone)
      }
      d[key] = clone
    }
  }

  const clone = shallowClone(data)
  clones.set(data, clone)
  dfs(clone)

  return clone
}
