import { Code, Snippet, Spinner } from '@nextui-org/react'
import { useCallback, useEffect, useState } from 'react'

import { useZeroTierStore } from '../../../store/zerotier.ts'
import { RefreshIcon } from '../../base/Icon.tsx'
import RefreshButton from '../../base/RefreshButton.tsx'

function ZerotierStatus() {
  const { status, getStatus } = useZeroTierStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const init = () => {
    getStatus()
      .then(() => setIsError(false))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }
  useEffect(init, [])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await getStatus()
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  return (
    <div className="overflow-x-hidden overflow-y-auto">
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
              <span>Failed to get status.</span>
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
