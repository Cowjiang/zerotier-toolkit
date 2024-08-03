import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RefreshButton from '../components/base/RefreshButton.tsx'
import StatusCard, { StatusCardProps } from '../components/base/StatusCard.tsx'
import { getNetworks } from '../services/zerotierService.ts'
import { useAppStore } from '../store/app.ts'
import { useZeroTierStore } from '../store/zerotier.ts'
import { ServiceStatus } from '../typings/enum.ts'

type CheckListItem = {
  key: string
  check?: Promise<StatusCardProps> | (() => void)
  checkResult?: StatusCardProps
}

function Troubleshooting() {
  const navigate = useNavigate()
  const { isAdmin, restartAsAdmin } = useAppStore()
  const { serviceState } = useZeroTierStore()

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
      check: () => ({ type: 'success' }),
    },
    {
      key: 'Check if ZeroTier can be managed',
      check: async () => {
        const { status } = await getNetworks()
        const statusMap: { [key: number | string]: StatusCardProps } = {
          200: { type: 'success' },
          default: { type: 'danger', content: 'ZeroTier can not be managed' },
        }
        return statusMap?.[status] ?? statusMap['default']
      },
    },
    {
      key: 'Check if local service is running',
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
  ]

  const [overrideResult, setOverrideResult] = useState<Record<string, StatusCardProps>>({})
  useEffect(() => {
    checkList.map(async ({ key, check }) => {
      if (check && typeof check === 'function') {
        const checkResult: StatusCardProps = await (typeof check === 'function'
          ? (check() as unknown as Promise<StatusCardProps>)
          : check)
        setOverrideResult((prev) => ({ ...prev, [key]: checkResult }))
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
