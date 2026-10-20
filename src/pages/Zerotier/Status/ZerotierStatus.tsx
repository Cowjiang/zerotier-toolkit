import { Alert, Button, Chip, Spinner, Tooltip } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import CopyText from '../../../components/base/CopyText.tsx'
import { CopyIcon } from '../../../components/base/Icon.tsx'
import RefreshButton from '../../../components/base/RefreshButton.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { HttpResponse } from '../../../typings/global.ts'
import { Status } from '../../../typings/zerotier.ts'
import { copyToClipboard } from '../../../utils/helpers/tauriHelpers.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import StatusDetails from './StatusDetails.tsx'

function CopyAddressButton({ address }: { address?: string }) {
  const { t } = useTranslation()
  const [isCopied, setIsCopied] = useState(false)

  if (!address) {
    return null
  }

  const onCopy = async () => {
    await copyToClipboard(address)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 750)
  }

  return (
    <Tooltip isOpen={isCopied} content={<Trans>Copied</Trans>} color="foreground" closeDelay={750} placement="right">
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="w-7 h-7 min-w-7 text-default-500"
        aria-label={t('Copy address')}
        onPress={onCopy}
      >
        <CopyIcon width={18} height={18} />
      </Button>
    </Tooltip>
  )
}

function ZerotierStatus() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { request } = useRequest()
  const { status, getStatus } = useZeroTierStore()

  const [isLoading, setIsLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState<number>()
  const [updatedAt, setUpdatedAt] = useState<number>()
  const isError = errorStatus !== undefined

  const init = () => {
    request(getStatus())
      .then(() => {
        setErrorStatus(undefined)
        setUpdatedAt(Date.now())
      })
      .catch((e: HttpResponse<Status>) => setErrorStatus(e?.status ?? 0))
      .finally(() => setIsLoading(false))
  }
  useEffect(init, [])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await request(getStatus())
      setErrorStatus(undefined)
      setUpdatedAt(Date.now())
    } catch (e) {
      setErrorStatus((e as HttpResponse<Status>)?.status ?? 0)
    } finally {
      setTimeout(() => setIsRefreshing(false), 300)
    }
  }, [])

  const isAuthError = errorStatus === 401
  const statusColor: 'success' | 'warning' | 'danger' = isError
    ? 'danger'
    : status?.online
      ? status.tcpFallbackActive
        ? 'warning'
        : 'success'
      : 'danger'
  const heroColor =
    statusColor === 'danger' ? 'bg-danger/20' : statusColor === 'warning' ? 'bg-warning/20' : 'bg-success/20'
  const updatedTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : undefined

  return (
    <>
      <div className="overflow-x-hidden overflow-y-auto pb-4">
        {isLoading ? (
          <div className="w-full h-[60vh] flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className={`w-full rounded-large p-2.5 flex items-center gap-3 ${heroColor}`}>
              <div className="min-w-0 flex flex-col gap-1">
                <p className="text-tiny font-bold uppercase">
                  <Trans>Node ID</Trans>
                </p>
                <div className="flex items-center gap-1">
                  <CopyText className="font-mono text-lg font-semibold tracking-wide" copyValue={status?.address}>
                    {status?.address ?? '-'}
                  </CopyText>
                  <CopyAddressButton address={status?.address} />
                </div>
                {!isError && (updatedTime || !status?.online) && (
                  <div className="flex flex-wrap items-center gap-x-1.5">
                    {updatedTime && (
                      <span className="text-tiny text-default-600">
                        {t('Updated at {{time}}', { time: updatedTime })}
                      </span>
                    )}
                    {!status?.online && (
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        className="h-5 min-w-0 p-0 text-tiny underline underline-offset-2"
                        onPress={() => navigate('/troubleshooting')}
                      >
                        <Trans>Troubleshooting</Trans>
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="ml-auto flex flex-shrink-0 items-center gap-2">
                {!isError && (
                  <Chip size="sm" variant="flat" color={statusColor}>
                    <Trans>{status?.online ? 'Online' : 'Offline'}</Trans>
                  </Chip>
                )}
              </div>
            </div>
            {isError ? (
              <Alert
                color="danger"
                title={t('Failed to get status.')}
                description={
                  <Trans>
                    {isAuthError ? 'Authentication is invalid or missing' : 'Failed to connect to ZeroTier service'}
                  </Trans>
                }
                endContent={
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={() => navigate(isAuthError ? '/zerotier/experiments' : '/troubleshooting')}
                  >
                    <Trans>{isAuthError ? 'Configure' : 'Troubleshooting'}</Trans>
                  </Button>
                }
              />
            ) : (
              <StatusDetails status={status} />
            )}
          </div>
        )}
      </div>
      <div className="fixed bottom-8 right-10 z-10">
        <RefreshButton
          showIcon
          buttonProps={{ variant: 'shadow', color: 'secondary', radius: 'full' }}
          isLoading={isRefreshing}
          onRefresh={onRefresh}
        />
      </div>
    </>
  )
}

export default ZerotierStatus
