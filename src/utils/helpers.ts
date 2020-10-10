import _ from 'lodash'
import color from 'color'

export const isBrowser = () => typeof window === 'object'

export const createVerbs = (prefix: string, verbs: string[]) =>
  _.mapValues(_.keyBy(verbs), (verb) => `${prefix}:${verb}`)

const noLikeChars = '123456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ'
export const randomId = (length: number) =>
  _.sampleSize(noLikeChars, length).join('')

export const emptyOne: Readonly<{}> = {}

export const invokeIfFunction = <A>(
  func: ((...a: any) => A) | A,
  ...args: any[]
): A => {
  if (_.isFunction(func)) {
    return func(...args)
  }
  return func
}

export const makeHash = (text: string) => {
  let hash = 0
  if (text.length == 0) {
    return hash
  }
  for (var i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

export const makeColor = (id: string) => {
  const c = color.hsl(
    Math.abs(makeHash(id.substring(0, 6))) % 360,
    (Math.abs(makeHash(id.substring(6, 12))) % 50) + 50,
    (Math.abs(makeHash(id.substring(12, 18))) % 50) + 30,
  )
  return c.hsv().string()
}

export const makeDate = (date: any) => {
  if (date instanceof Date) return date

  switch (typeof date) {
    case 'string':
    case 'number':
      return new Date(date)
    case 'object':
      if (!date) return new Date(NaN)
      if ('toDate' in date) return date.toDate()
      if ('seconds' in date && 'nanoseconds' in date) {
        // firestore timestamp
        const d1 = date as { seconds: number; nanoseconds: number }
        return new Date(d1.seconds * 1000 + d1.nanoseconds / 1000)
      }
      return new Date(NaN)
    default:
      return new Date(NaN)
  }
}

export const omitNull = (data: unknown): any => {
  if (data instanceof Array) return _.map(data, omitNull)
  if (typeof data === 'object' && data !== null) {
    const ndata = _.mapValues(data, omitNull)
    const mdata = _.pickBy(ndata, (d) => d !== null)
    if (!Object.keys(mdata).length) return null
    return mdata
  }
  return data === undefined ? null : data
}

export const omitNaN = (data: unknown): any => {
  if (data instanceof Array) return _.map(data, omitNaN)
  if (typeof data === 'object' && data !== null) {
    const ndata = _.mapValues(data, omitNaN)
    const mdata = _.pickBy(ndata, (d) => !Number.isNaN(d))
    if (!Object.keys(mdata).length) return NaN
    return mdata
  }
  return data === undefined ? NaN : data
}

export const omitUndefined = (data: unknown): any => {
  if (data instanceof Array) {
    const narray = data.map(omitUndefined)
    const marray = narray.filter((d) => typeof d !== 'undefined')
    return marray
  }
  if (typeof data === 'object' && data !== null) {
    const ndata = _.mapValues(data, omitUndefined)
    const mdata = _.omitBy(ndata, (d) => typeof d === 'undefined')
    if (!Object.keys(mdata).length) return undefined
    return mdata
  }
  return typeof data === 'undefined' ? undefined : data
}
