import { describe, expect, it } from 'vitest'
import {
  isArray,
  isObject,
  isArrOrObj,
  isReferencified,
  shallowClone,
  deepClone,
} from '../src/utils'

describe.concurrent('referencify', () => {
  it('isArray', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
    expect(isArray(10)).toBe(false)
    expect(isArray('foo')).toBe(false)
  })

  it('isObject', () => {
    expect(isObject([])).toBe(true)
    expect(isObject({})).toBe(true)
    expect(isObject(10)).toBe(false)
    expect(isObject('foo')).toBe(false)
  })

  it('isArrOrObj', () => {
    expect(isArrOrObj([])).toBe(true)
    expect(isArrOrObj({})).toBe(true)
    expect(isArrOrObj(10)).toBe(false)
    expect(isArrOrObj('foo')).toBe(false)
  })

  it('isReferencified', () => {
    expect(isReferencified([])).toBe(false)
    expect(isReferencified({})).toBe(false)
    expect(isReferencified(10)).toBe(false)
    expect(isReferencified('foo')).toBe(false)
    expect(
      isReferencified({ refs: { '_ref_0': { foo: 'bar' } }, root: '_ref_0' })
    ).toBe(true)
  })

  it('shallowClone', () => {
    type TestData = { arr: number[], self?: TestData }
    const obj: TestData = { arr: [0, 1, 2] }
    obj.self = obj
    const clonedObj = shallowClone(obj)
    const clonedArr = shallowClone(obj.arr)
    expect(obj).toMatchObject(clonedObj)
    expect(obj.arr).toMatchObject(clonedArr)
    expect(obj === clonedObj).toBe(false)
    expect(obj.arr === clonedObj.arr).toBe(true)
    expect(obj.arr === clonedArr).toBe(false)
    expect(clonedObj.self === clonedObj).toBe(false)
    expect(clonedObj.self === obj).toBe(true)
  })

  it('deepClone', () => {
    type TestData = { arr: number[], self?: TestData }
    const obj: TestData = { arr: [0, 1, 2] }
    obj.self = obj
    const clonedObj = deepClone(obj)
    expect(obj).toMatchObject(clonedObj)
    expect(obj === clonedObj).toBe(false)
    expect(obj.arr === clonedObj.arr).toBe(false)
    expect(obj === obj.self).toBe(true)
    expect(clonedObj.self === clonedObj).toBe(true)
    expect(clonedObj.self === obj).toBe(false)
  })
})
