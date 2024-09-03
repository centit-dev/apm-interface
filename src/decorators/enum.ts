import { SpanKind, SpanStatus, TraceBriefStatusEnum } from '@/api'

export function spanStatusText(status: SpanStatus) {
  switch (status) {
    case SpanStatus.SYS_FAULT:
      return '系统失败'
    case SpanStatus.SUCCEED:
      return '成功'
    case SpanStatus.BIZ_FAULT:
      return '业务失败'
    default:
      return status
  }
}

export function spanKindText(value: SpanKind) {
  switch (value) {
    case SpanKind.CLIENT:
      return '客户端'
    case SpanKind.SERVER:
      return '服务端'
    case SpanKind.INTERNAL:
      return '内部方法'
    case SpanKind.PRODUCER:
      return '消息生产者'
    case SpanKind.CONSUMER:
      return '消息消费者'
    default:
      return value
  }
}

export function traceStatusText(status: TraceBriefStatusEnum) {
  switch (status) {
    case TraceBriefStatusEnum.Success:
      return '成功'
    case TraceBriefStatusEnum.BusinessFault:
      return '业务失败'
    case TraceBriefStatusEnum.SystemFault:
      return '系统错误'
    case TraceBriefStatusEnum.Timeout:
      return '超时'
    default:
      return status
  }
}
