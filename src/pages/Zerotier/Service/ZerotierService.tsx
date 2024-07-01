import { Button, ButtonProps, Select, SelectItem } from '@nextui-org/react'
import { ReactElement, useMemo, useState } from 'react'

import { useAppStore } from '../../../store/app.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { ServiceStartType, ServiceStatus } from '../../../typings/enum.ts'

const startTypes = [
  {
    label: 'Automatic',
    value: ServiceStartType.AUTO_START,
  },
  {
    label: 'Manual',
    value: ServiceStartType.DEMAND_START,
  },
  {
    label: 'Disabled',
    value: ServiceStartType.DISABLED,
  },
]

function ZerotierService() {
  const { isAdmin, restartAsAdmin } = useAppStore()
  const { serviceState, serviceStartType, startService, stopService, setServiceStartType } = useZeroTierStore()

  const [statusBtnLoading, setStatusBtnLoading] = useState(false)
  const serviceStatusButton = useMemo(() => {
    const isRunning = serviceState === ServiceStatus.RUNNING
    return {
      label: statusBtnLoading ? '' : isRunning ? ServiceStatus.RUNNING : ServiceStatus.STOPPED,
      color: isRunning ? 'success' : 'danger',
      startContent: statusBtnLoading ? <></> : <span className="w-2 h-2 ml-1 rounded-full bg-current"></span>,
    } as {
      label: string
      color: ButtonProps['color']
      startContent: ReactElement
    }
  }, [serviceState, statusBtnLoading, isAdmin])
  const handleServiceBtnClick = async () => {
    if (isAdmin) {
      setStatusBtnLoading(true)
      await (serviceState === ServiceStatus.RUNNING ? stopService() : startService())
      setStatusBtnLoading(false)
    }
  }

  const currentStartType = useMemo(() => new Set([serviceStartType]), [serviceStartType])
  const handleStartTypeSelect = (keys: Set<string | number> | 'all') => {
    if (keys === 'all') {
      return
    }
    const startType = keys.values().next().value
    isAdmin && startType && setServiceStartType(startType)
  }

  return (
    <div className="flex flex-col">
      <section>
        {!isAdmin && (
          <Button
            className="mb-6 whitespace-normal py-2.5 h-auto"
            fullWidth
            color="warning"
            variant="flat"
            onPress={restartAsAdmin}
          >
            Please click here to relaunch as Administrator for management
          </Button>
        )}
        <div className="flex items-center">
          <p className="text-default-700">Service status</p>
          <div className="ml-auto flex gap-4">
            <Button
              aria-label="switch the state of ZeroTier service"
              className="w-32"
              variant="flat"
              color={serviceStatusButton.color}
              startContent={serviceStatusButton.startContent}
              isLoading={statusBtnLoading}
              isDisabled={!isAdmin}
              onPress={handleServiceBtnClick}
            >
              {serviceStatusButton.label}
            </Button>
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <p className="text-default-700">Start type</p>
          <div className="ml-auto flex gap-4">
            <Select
              className="w-32"
              label="change the start type of ZeroTier service"
              labelPlacement="outside"
              classNames={{ label: 'hidden', base: '!mt-0' }}
              selectionMode="single"
              isDisabled={!isAdmin}
              selectedKeys={currentStartType}
              onSelectionChange={handleStartTypeSelect}
              test-id="select"
              items={startTypes}
            >
              {(type) => (
                <SelectItem key={type.value} value={type.value} test-id="option">
                  {type.label}
                </SelectItem>
              )}
            </Select>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ZerotierService
