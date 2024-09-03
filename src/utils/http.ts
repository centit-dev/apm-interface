import { Configuration } from '@/api'

export const configuration = new Configuration({
  basePath: import.meta.env.VITE_HTTP_HOST,
  baseOptions: {
  }
})
