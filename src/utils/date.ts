import { isSameDay } from 'date-fns'
import dayjs from 'dayjs'

export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export function msToSecondsText(ms: number) {
  let remainingMs = ms

  if (remainingMs < 1000) {
    return `${remainingMs}ms`
  }

  return (remainingMs / 1000).toFixed(2) + 's'
}

export function secondsToText(seconds: number) {
  let remainingSeconds = seconds

  const hours = Math.floor(remainingSeconds / 3600)
  remainingSeconds = remainingSeconds % 3600

  const minutes = Math.floor(remainingSeconds / 60)
  remainingSeconds = remainingSeconds % 60

  return [
    hours > 0 ? `${hours}小时` : undefined,
    minutes > 0 ? `${minutes}分钟` : undefined,
    remainingSeconds > 0 ? `${remainingSeconds}秒` : undefined
  ]
    .filter((v) => v)
    .join('')
}

export function format(date: Date | number, template = DATE_TIME_FORMAT) {
  if (!date) {
    return ''
  }

  return dayjs(date).format(template)
}

export function formatTimeRange(startDate: Date | number, endDate: Date | number) {
  if (!startDate || !endDate) {
    return ''
  }

  const template = 'YYYY-MM-DD HH:mm:ss'

  if (isSameDay(startDate, endDate)) {
    return `${format(startDate, template)} - ${format(endDate, 'HH:mm:ss')}`
  }

  return `${format(startDate, template)} - ${format(endDate, template)}`
}
