import { listen } from '@tauri-apps/api/event'
import type { UnlistenFn } from '@tauri-apps/api/helpers/event'
import { useEffect, useRef } from 'react'

const useTauriEventListener = (eventName: string, handler?: (payload: any) => void) => {
  const savedHandler = useRef<{ handler?: (payload: any) => void; unListenFn?: UnlistenFn }>()
  useEffect(() => {
    if (!savedHandler.current) {
      savedHandler.current = { handler: handler }
      ;(async function () {
        const unListenFn = await listen(eventName, (event) => {
          handler?.(event.payload)
        })
        savedHandler.current = { ...savedHandler.current, unListenFn }
      })()
    }

    return () => {
      if (savedHandler.current?.unListenFn) {
        savedHandler.current?.unListenFn()
      }
    }
  }, [])
}

export default useTauriEventListener
