import { Code, Snippet, Spinner } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'

import { RefreshIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import { Trans } from 'react-i18next'

function ZerotierStatus() {
  const { request } = useRequest()
  const { status, getStatus } = useZeroTierStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const init = () => {
    request(getStatus())
      .then(() => setIsError(false))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }
  useEffect(init, [])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await request(getStatus())
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  return (
    <div className="overflow-x-hidden overflow-y-auto pb-4">
      {isLoading ? (
        <div className="w-full h-[60vh] flex justify-center items-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <Snippet
            codeString={status?.address}
            color={isError ? 'default' : 'primary'}
            size="lg"
            radius="md"
            hideSymbol
            disableCopy={isError}
          >
            {`My Address: ${status?.address ?? '-'}`}
          </Snippet>
          {isError ? (
            <div className="flex flex-col justify-center items-center gap-4 h-[50vh]">
              <span><Trans>Failed to get status.</Trans></span>
              <div>
                <RefreshButton
                  buttonProps={{
                    color: 'primary',
                    variant: 'flat',
                    endContent: <RefreshIcon width="16" height="16" />,
                  }}
                  isLoading={isRefreshing}
                  onRefresh={onRefresh}
                />
              </div>
            </div>
          ) : (
            <Code className="p-4" radius="md">
              <pre className="overflow-x-auto">{JSON.stringify(status || {}, null, 2)}</pre>
            </Code>
          )}
        </div>
      )}
    </div>
  )
}

export default ZerotierStatus
