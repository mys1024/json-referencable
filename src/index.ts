import type { Referencified } from './types'
import { isArrOrObj, isReferencified, deepClone } from './utils'

const DEFAULT_PREFIX = '_ref_'

export function referencify(
  data: object | unknown[],
  options: {
    prefix?: string,
    clone?: boolean,
  } = {},
): Referencified {
  const { prefix = DEFAULT_PREFIX, clone = true } = options

  if (clone)
    data = deepClone(data)

  const memo: Map<object | unknown[], string> = new Map()
  let acc = 0

  const ref = (d: object | unknown[]) => {
    let id = `${prefix}${acc++}`
    memo.set(d, id)
    return id
  }

  const dfs = (d: object | unknown[]) => {
    if (!isArrOrObj(d))
      throw new Error('not an array or object')
    for (const key in d) {
      const val = d[key]
      if (!isArrOrObj(val))
        continue
      let id = memo.get(val)
      if (id === undefined) {
        id = ref(val)
        dfs(val)
      }
      d[key] = id
    }
  }

  const root = ref(data)
  dfs(data)

  const refs: Record<string, object | unknown[]> = {}
  for (const [val, key] of memo.entries()) {
    refs[key] = val
  }

  return { refs, root }
}

export function stringify(
  data: object | unknown[],
  options: {
    prefix?: string,
    clone?: boolean,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number,
  } = {},
): string {
  const { prefix = DEFAULT_PREFIX, clone = true, replacer, space } = options
  return JSON.stringify(referencify(data, { prefix, clone }), replacer, space)
}

export function parse<T extends object | unknown[]>(
  json: string,
  options: {
    prefix?: string,
  } = {},
): T {
  const { prefix = DEFAULT_PREFIX } = options

  const referencified = JSON.parse(json)
  if (!isReferencified(referencified))
    throw new Error('not a referencable JSON string')

  const { refs, root } = referencified
  const data = refs[root]
  if (!isArrOrObj(data))
    throw new Error(`wrong ref id: ${root}`)

  const dfs = (d: object | unknown[]) => {
    for (const key in d) {
      const maybeId = d[key]
      if (typeof maybeId !== 'string' || !maybeId.startsWith(prefix))
        continue
      const val = refs[maybeId]
      if (!isArrOrObj(val))
        throw new Error(`wrong ref id: ${maybeId}`)
      d[key] = val
      dfs(val)
    }
  }

  dfs(data)

  return data as T
}
