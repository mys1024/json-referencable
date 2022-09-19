interface Referencified {
  refs: Record<string, object | unknown[]>
  root: string
}

function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

function isObject(val: unknown): val is object {
  return typeof val === 'object'
}

function isArrOrObj(val: unknown): val is object | unknown[] {
  return isArray(val) || isObject(val)
}

function isReferencified(val: any): val is Referencified {
  return isObject(val?.refs) && typeof val?.root === 'string'
}

export function referencify(
  data: object | unknown[],
  prefix = '_ref_',
): Referencified {
  const map: Map<object | unknown[], string> = new Map()
  let acc = 0

  const ref = (d: object | unknown[]) => {
    let id = `${prefix}${acc++}`
    map.set(d, id)
    return id
  }

  const dfs = (d: object | unknown[]) => {
    if (!isArrOrObj(d))
      throw new Error('type error')
    for (const key in d) {
      const val = d[key]
      if (!isArrOrObj(val))
        continue
      let id = map.get(val)
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
  for (const [val, key] of map.entries()) {
    refs[key] = val
  }

  return { refs, root }
}

export function stringify(
  data: object | unknown[],
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): string {
  return JSON.stringify(referencify(data), replacer, space)
}

export function parse<T extends object | unknown[]>(
  json: string,
  prefix = '_ref_',
): T {
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
