export function parseJSON<T>(data: string) {
  if (!data) return

  try {
    return JSON.parse(data) as T
  } catch (error) {
    console.error(error)
  }
}
