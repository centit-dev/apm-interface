import {
  DefaultApi,
  type ConditionKey,
  type FieldCondition,
  type FieldConditionResponse,
  type NameDisplayPair
} from '@/api'
import type { DataType } from '@/interfaces/data-type'
import { configuration } from '@/utils/http'

export interface QueryFilterRequests {
  listConditionKeys: () => Promise<ConditionKey[]>
  getDataTypeOperators: (key: string) => Promise<NameDisplayPair[]>
  listConditionValues: (id: number) => Promise<string[]>
}

export function toFieldConditions(data: FieldConditionResponse[]): FieldCondition[] {
  return data.map((item) => {
    return {
      name: item.name.name,
      operator: item.operator.name,
      value: item.value
    }
  })
}

export function queryFilterRequestsGenerator(dataType: DataType): QueryFilterRequests {
  const api = new DefaultApi(configuration)

  return {
    listConditionKeys: () =>
      api.listConditionKeys(dataType).then((response) => response.data.data || []),
    getDataTypeOperators: (key: string) =>
      api.getDataTypeOperators(key).then((response) => response.data.data || []),
    listConditionValues: (id: number) =>
      api.listConditionValues(id).then((response) => response.data.data || [])
  }
}
