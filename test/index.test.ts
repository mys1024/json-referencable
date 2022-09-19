import { describe, expect, it } from 'vitest'
import { referencify, stringify, parse } from '../src/index'

interface Student {
  name: string
  id: number
  class: Class,
  friends: Student[]
}

interface Class {
  students: Student[]
}

function createTestData() {
  const c1: Class = {
    students: []
  }
  const s1: Student = {
    name: 'A',
    id: 1,
    class: c1,
    friends: []
  }
  const s2: Student = {
    name: 'B',
    id: 2,
    class: c1,
    friends: []
  }
  c1.students.push(s1, s2)
  s1.friends.push(s2)
  s2.friends.push(s1)
  return c1
}

describe.concurrent('referencify', () => {
  it('test1', () => {
    expect(referencify(createTestData())).toMatchSnapshot()
  })
})

describe.concurrent('stringify ', () => {
  it('test1', () => {
    expect(stringify(createTestData())).toMatchSnapshot()
  })
})

describe.concurrent('parse ', () => {
  it('test1', () => {
    const json = `{
      "refs": {
        "_ref_0": ["_ref_0"]
      },
      "root": "_ref_0"
    }`
    const arr: unknown[] = []
    arr.push(arr)
    expect(parse(json)).toMatchObject(arr)
  })
})

describe.concurrent('stringify and parse ', () => {
  it('test1', () => {
    const arr: unknown[] = []
    arr.push(arr)
    const parsedArr = parse<unknown[]>(stringify(arr))
    expect(parsedArr).toBe(parsedArr[0])
  })

  it('test2', () => {
    const obj: { self: unknown } = { self: undefined }
    obj.self = obj
    const parsedObj = parse<{ self: unknown }>(stringify(obj))
    expect(parsedObj).toBe(parsedObj.self)
  })

  it('test3', () => {
    const data = createTestData()
    const obj: { self: unknown } = { self: undefined }
    obj.self = obj
    const parsedData = parse<Class>(stringify(data))
    expect(parsedData.students[0].class).toBe(parsedData)
    expect(parsedData.students[0].class).toBe(parsedData.students[1].class)
    expect(parsedData.students[0].friends[0]).toBe(parsedData.students[1])
    expect(parsedData.students[1].friends[0]).toBe(parsedData.students[0])
  })
})
