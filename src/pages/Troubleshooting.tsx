import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RefreshButton from '../components/base/RefreshButton.tsx'
import StatusCard, { StatusCardProps } from '../components/base/StatusCard.tsx'
import { getNetworks } from '../services/zerotierService.ts'
import { useAppStore } from '../store/app.ts'
import { useZeroTierStore } from '../store/zerotier.ts'
import { ServiceStatus } from '../typings/enum.ts'

type CheckListItem = {
  key: string
  check: (item: CheckListItem['key']) => void
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
      check: (key) => {
        setCheckResult((prevResult) => ({
          ...prevResult,
          [key]: { type: 'success', title: key },
        }))
      },
    },
    {
      key: 'Check if ZeroTier can be managed',
      check: async (key) => {
        const { status } = await getNetworks()
        const statusMap: { [key: number | string]: StatusCardProps } = {
          200: { type: 'success' },
          default: { type: 'danger', content: 'ZeroTier can not be managed' },
        }
        setCheckResult((prevResult) => ({
          ...prevResult,
          [key]: statusMap[status],
        }))
      },
    },
    {
      key: 'Check if local service is running',
      check: (key) => {
        const isRunning = serviceState === ServiceStatus.RUNNING
        setCheckResult((prevResult) => ({
          ...prevResult,
          [key]: {
            type: isRunning ? 'success' : 'danger',
            content: isRunning ? '' : 'ZeroTier service is not running, click here to run',
            onClick: isRunning ? undefined : () => navigate('/zerotier/service'),
          },
        }))
      },
    },
    {
      key: 'Check if the toolkit is running as Admin',
      check: (key) => {
        setCheckResult((prevResult) => ({
          ...prevResult,
          [key]: {
            type: isAdmin ? 'success' : 'warning',
            content: isAdmin ? '' : 'Click here to relaunch as Administrator',
            onClick: isAdmin ? undefined : () => restartAsAdmin(),
          },
        }))
      },
    },
  ]

  const [checkResult, setCheckResult] = useState<Record<string, StatusCardProps>>({})
  useEffect(() => {
    checkList.map(({ key, check }) => check(key))
  }, [forceCheckTime])

  return (
    <>
      <div className="overflow-x-hidden overflow-y-auto pb-4">
        <div className="flex flex-col gap-2" key={forceCheckTime}>
          {checkList.map(({ key }) => {
            const result = checkResult[key]
            return result && <StatusCard key={key} title={key || result.title} {...result} />
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
