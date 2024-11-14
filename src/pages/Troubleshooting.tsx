import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RefreshButton from '../components/base/RefreshButton.tsx'
import StatusCard, { StatusCardProps } from '../components/base/StatusCard.tsx'
import { getNetworks } from '../services/zerotierService.ts'
import { useAppStore } from '../store/app.ts'
import { useZeroTierStore } from '../store/zerotier.ts'
import { ZerotierConfig } from '../typings/config.ts'
import { InvokeEvent, ServiceStatus } from '../typings/enum.ts'
import { invokeCommand } from '../utils/helpers'

type CheckListItem = {
  key: string
  check?: Promise<StatusCardProps> | (() => void)
  checkResult?: StatusCardProps
}

function Troubleshooting() {
  const navigate = useNavigate()
  const { isAdmin, restartAsAdmin } = useAppStore()
  const { serviceState, serverInfo, config, getServiceState } = useZeroTierStore()

  const [forceChecking, setForceChecking] = useState(false)
  const [forceCheckTime, setForceCheckTime] = useState(Date.now())
  const forceCheck = () => {
    setForceChecking(true)
    setForceCheckTime(Date.now())
    setTimeout(() => setForceChecking(false), 1000)
  }

  const checkList: CheckListItem[] = [
    {
      key: 'Check if ZeroTier is installed',
      check: async () => {
        const { success } = await invokeCommand(InvokeEvent.GET_ZEROTIER_ONE_DIR)
        return success ? { type: 'success' } : { type: 'danger', content: 'Could not find ZeroTier One Directory' }
      },
    },
    {
      key: 'Check if ZeroTier can be managed',
      check: async () => {
        const statusMap: { [key: number]: StatusCardProps } = {
          200: { type: 'success' },
          401: {
            type: 'danger',
            content: 'Authentication is invalid or missing, click here to modify',
            onClick: () => navigate('/zerotier/experiments'),
          },
          500: { type: 'danger', content: 'Failed to connect to ZeroTier service' },
        }
        const { port, secret } = serverInfo
        const { [ZerotierConfig.PORT]: overridePort, [ZerotierConfig.TOKEN]: overrideToken } = config
        if ((!overridePort || !overrideToken) && (!port || !secret)) {
          return statusMap[401]
        }
        try {
          const { status } = await getNetworks()
          return statusMap?.[status] ?? statusMap[500]
        } catch (e: any) {
          console.error(e)
          return e?.status ? statusMap?.[e.status] : statusMap[500]
        }
      },
      checkResult: { type: 'info', content: 'Trying to connect to ZeroTier service...' },
    },
    // #if WINDOWS
    {
      key: 'Check if local service is running',
      check: async () => {
        await getServiceState()
      },
      checkResult: useMemo(() => {
        const isRunning = serviceState === ServiceStatus.RUNNING
        return {
          type: isRunning ? 'success' : 'danger',
          content: isRunning ? '' : 'ZeroTier service is not running, click here to run',
          onClick: isRunning ? undefined : () => navigate('/zerotier/service'),
        }
      }, [serviceState]),
    },
    {
      key: 'Check if the toolkit is running as Admin',
      checkResult: {
        type: isAdmin ? 'success' : 'warning',
        content: isAdmin ? '' : 'Click here to relaunch as Administrator',
        onClick: isAdmin ? undefined : () => restartAsAdmin(),
      },
    },
    // #endif
  ]

  const [overrideResult, setOverrideResult] = useState<Record<string, StatusCardProps>>({})
  useEffect(() => {
    setOverrideResult({})
    checkList.map(async ({ key, check }) => {
      if (check && typeof check === 'function') {
        const checkResult: StatusCardProps = await (typeof check === 'function'
          ? (check() as unknown as Promise<StatusCardProps>)
          : check)
        checkResult && setOverrideResult((prev) => ({ ...prev, [key]: checkResult }))
      }
    })
  }, [forceCheckTime])

  return (
    <>
      <div className="overflow-x-hidden overflow-y-auto pb-4">
        <div className="flex flex-col gap-2">
          {checkList.map(({ key, checkResult }) => {
            const result = overrideResult[key] ?? checkResult
            return result && <StatusCard key={key} title={result?.title ?? key} {...result} />
          })}
        </div>
      </div>
      <div className="fixed bottom-8 right-10 z-10">
        <RefreshButton
          showIcon
          buttonProps={{
            variant: 'shadow',
            color: 'secondary',
            radius: 'full',
          }}
          isLoading={forceChecking}
          onRefresh={forceCheck}
        />
      </div>
    </>
  )
}

export default Troubleshooting
