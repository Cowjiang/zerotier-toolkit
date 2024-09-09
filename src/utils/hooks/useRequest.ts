import { Link } from '@nextui-org/react'
import { Response } from '@tauri-apps/api/http'
import { createElement } from 'react'

import { useNotification } from '../../components/providers/NotificationProvider.tsx'

const useRequest = () => {
  const { setNotification } = useNotification()
  return {
    request: async <T>(request: Promise<T>) => {
      try {
        return await request
      } catch (e) {
        if ((e as Response<T>)?.status === 401) {
          setNotification({
            children: createElement(
              Link,
              {
                size: 'sm',
                color: 'danger',
                href: '/zerotier/experiments',
              },
              'Authentication is invalid, click here to configure',
            ),
            type: 'danger',
          })
        }
        throw e
      }
    },
  }
}

export default useRequest
