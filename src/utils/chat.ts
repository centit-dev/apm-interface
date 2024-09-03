import axios from 'axios'
import { Observable } from 'rxjs'
import { MD5 } from 'crypto-js'

export function aiChat(message: string, session_id?: string): Observable<any> {
  return new Observable((observer) => {
    if (!session_id) {
      session_id = MD5(message).toString()
    }

    axios
      .post(
        '/chat',
        { session_id, prompt: message },
        {
          headers: {
            Accept: 'text/event-stream'
          },
          responseType: 'stream',
          adapter: 'fetch'
        }
      )
      .then(async (response) => {
        const stream = response.data

        const reader = stream.pipeThrough(new TextDecoderStream()).getReader()

        while (true) {
          const { value, done } = await reader.read()

          if (value) {
            try {
              observer.next(extractDataFromSSE(value))
            } catch (e) {
              observer.error(e)
            }
          }

          if (done) break
        }
      })
      .catch((error) => {
        observer.error(error)
      })
  })
}

function extractDataFromSSE(value: string) {
  const regex = /data:\s*(?:data:)?\s*({.*})/
  const lines = value.split('\n')

  for (const line of lines) {
    const match = line.match(regex)
    if (match && match[1]) {
      const jsonData = match[1].trim()

      if (jsonData) {
        try {
          return JSON.parse(jsonData)
        } catch (e) {
          console.error('Failed to parse JSON:', e)
        }
      }
    }
  }
}
