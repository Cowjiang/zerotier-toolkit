import { Link } from '@heroui/react'
import { createElement } from 'react'

import { useNotification } from '../../components/providers/NotificationProvider.tsx'
import { HttpResponse } from '../../typings/global.ts'

const useRequest = () => {
  const { setNotification } = useNotification()
  return {
    request: async <T>(request: Promise<T>) => {
      try {
        return await request
      } catch (e) {
        if ((e as HttpResponse<T>)?.status === 401) {
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
