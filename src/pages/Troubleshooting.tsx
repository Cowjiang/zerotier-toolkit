import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import RefreshButton from '../components/base/RefreshButton.tsx'
import StatusCard, { StatusCardProps } from '../components/base/StatusCard.tsx'
import { useAppStore } from '../store/app.ts'
import { useZeroTierStore } from '../store/zerotier.ts'
import { ServiceStatus } from '../typings/enum.ts'

type CheckListItem = {
  title: string
  check: () => Omit<StatusCardProps, 'title'>
}

function Troubleshooting() {
  const navigate = useNavigate()
  const { isAdmin, restartAsAdmin } = useAppStore()
  const { serviceState } = useZeroTierStore()

  const checkList: CheckListItem[] = [
    {
      title: 'Check if ZeroTier is installed',
      check: () => ({
        type: 'success',
      }),
    },
    {
      title: 'Check if ZeroTier is running',
      check: () => {
        const isRunning = serviceState === ServiceStatus.RUNNING
        return {
          type: isRunning ? 'success' : 'danger',
          content: isRunning ? '' : 'ZeroTier service is not running, click here to run',
          onClick: isRunning ? undefined : () => navigate('/zerotier/service'),
        }
      },
    },
    {
      title: 'Check if the toolkit is running as Admin',
      check: () => {
        return {
          type: isAdmin ? 'success' : 'warning',
          content: isAdmin ? '' : 'Click here to relaunch as Administrator',
          onClick: isAdmin ? undefined : () => restartAsAdmin(),
        }
      },
    },
  ]

  const [forceChecking, setForceChecking] = useState(false)
  const [forceCheckTime, setForceCheckTime] = useState(Date.now())
  const forceCheck = () => {
    setForceChecking(true)
    setForceCheckTime(Date.now())
    setTimeout(() => setForceChecking(false), 1000)
  }

  return (
    <>
      <div className="overflow-x-hidden overflow-y-auto pb-4">
        <div className="flex flex-col gap-2" key={forceCheckTime}>
          {checkList.map(({ title, check }) => {
            const checkResult = check()
            return <StatusCard key={title} title={title} {...checkResult} />
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
