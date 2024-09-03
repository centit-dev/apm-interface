import {
  cloneDeep,
  isArray,
  isBoolean,
  isNaN as lodashIsNaN,
  isNil,
  isNull,
  isNumber,
  isString,
  isUndefined
} from 'lodash'

export function prune<T extends Record<string, any>>(value: T): T {
  const clone: Record<string, any> = cloneDeep(value)

  Object.keys(clone).forEach((key) => {
    const item = clone[key]

    if (isEmptyValue(item)) {
      delete clone[key]

      return
    }

    if (isBoolean(item) || isNumber(item)) {
      return
    }

    if (isString(item) && item.length === 0) {
      delete clone[key]
    }

    if (isArray(item)) {
      if (item.length > 0) {
        const array = pruneArray(item)

        if (array.length > 0) {
          clone[key] = array
        } else {
          delete clone[key]
        }
      } else {
        delete clone[key]
      }
    }
  })

  return clone as T
}

export function pruneArray(array: unknown[]): unknown[] {
  const clone = cloneDeep(array)

  return clone
    .map((item) => {
      if (isArray(item)) {
        return pruneArray(item)
      }

      return item
    })
    .filter((item) => {
      if (isArray(item)) {
        return item.length > 0
      }

      return !isEmptyValue(item) || !isEmptyString(item)
    })
}

function isEmptyValue<T>(value: T): boolean {
  return (
    lodashIsNaN(value) ||
    isNil(value) ||
    isNull(value) ||
    isUndefined(value) ||
    isEmptyString(value)
  )
}

function isEmptyString<T>(value: T): boolean {
  return isString(value) && value.length === 0
}
