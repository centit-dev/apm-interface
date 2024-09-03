import type { Percentile } from '@/api'

export const spanDurationTrendsChartTypes = ['selfDurations', 'gaps', 'traceDurations'] as const

export type SpanDurationTrendsChartType = (typeof spanDurationTrendsChartTypes)[number]

export interface SpanDurationTrendsChartDataItem {
  date: Date
  value: number
  snapshotId: string
  color: string
}

export type SpanDurationTrendsChartData = Record<
  SpanDurationTrendsChartType,
  Partial<Record<Percentile, SpanDurationTrendsChartDataItem[]>>
>

export interface SpanDurationTrendsDurationData
  extends Record<
    SpanDurationTrendsChartType,
    Partial<Record<Percentile, SpanDurationTrendsChartDataItem[]>>
  > {
  time: Date
  total: number
  colors: Record<string, string>
}

export function spanDurationTrendsChartTypeText(type: SpanDurationTrendsChartType) {
  switch (type) {
    case 'selfDurations':
      return '自身'
    case 'gaps':
      return 'GAP'
    case 'traceDurations':
      return 'Trace'
  }
}
