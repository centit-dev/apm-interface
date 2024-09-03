import { Subject, interval, startWith, switchMap, takeUntil } from 'rxjs'

export function createControlableInterval(period: number) {
  const stream$ = interval(period)

  const openSubject = new Subject<void>()
  const closeSubject = new Subject<void>()

  const stream = openSubject.pipe(
    startWith(null),
    switchMap(() => stream$.pipe(takeUntil(closeSubject)))
  )

  return {
    stream,
    open: () => openSubject.next(),
    close: () => closeSubject.next()
  }
}
