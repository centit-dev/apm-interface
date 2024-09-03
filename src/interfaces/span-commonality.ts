import type { SpanCommonality, SpanCommonalityValue } from '@/api'

export interface SpanCommonalityData extends Omit<SpanCommonality, 'values'>, SpanCommonalityValue {
  uniqueName: string
}
