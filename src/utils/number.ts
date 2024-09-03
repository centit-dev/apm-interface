export function humanizeNumber(number: number): string {
  if (number < 1000) {
    return number.toString()
  }

  if (number < 1000000) {
    return `${(number / 1000).toFixed(2)}k`
  }

  if (number < 1000000000) {
    return `${(number / 1000000).toFixed(2)}m`
  }

  return `${(number / 1000000000).toFixed(2)}b`
}
