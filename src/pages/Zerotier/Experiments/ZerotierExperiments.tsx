import { Button, Code, Input, Tooltip } from '@nextui-org/react'

import { InterrogationIcon } from '../../../components/base/Icon.tsx'
import { useNotification } from '../../../components/providers/NotificationProvider.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { ZerotierConfig } from '../../../typings/config.ts'
import { InvokeEvent } from '../../../typings/enum.ts'
import { invokeCommand } from '../../../utils/helpers/tauriHelpers.ts'

function SecretTooltip() {
  return (
    <Tooltip
      color="secondary"
      closeDelay={500}
      content={
        <div className="px-2 py-3 flex flex-col gap-2">
          <div className="text-small font-bold">How to find secret token and port</div>
          <div className="text-small">
            <p className="flex gap-4">
              <b>MacOS:</b>
              <span>~/Library/Application Support/ZeroTier</span>
            </p>
            <p className="flex gap-4">
              <b>Windows:</b>
              <span>\ProgramData\ZeroTier\One</span>
            </p>
            <p className="flex gap-4">
              <b>Linux:</b>
              <span>/var/lib/zerotier-one</span>
            </p>
          </div>
          <div className="text-small">
            Find <Code>authtoken.secret</Code> file in the paths above
          </div>
        </div>
      }
    >
      <div className="cursor-pointer text-default-500">
        <InterrogationIcon width={16} />
      </div>
    </Tooltip>
  )
}

function ZerotierExperiments() {
  const { serverInfo, config, setConfig } = useZeroTierStore()
  const { setNotification } = useNotification()

  const openZeroTierOneDir = async () => {
    const { success } = await invokeCommand(InvokeEvent.OPEN_ZEROTIER_ONE_DIR)
    !success && setNotification({ type: 'danger', children: 'Failed to open ZeroTier One directory', duration: 2000 })
  }

  const onTokenChanged = (value: string) => {
    setConfig({ [ZerotierConfig.TOKEN]: value })
  }

  const onPortChanged = (value: string) => {
    setConfig({ [ZerotierConfig.PORT]: Number(value) })
  }

  return (
    <div className="flex flex-col">
      <section>
        <div>
          <p className="font-bold text-large">ZeroTier One</p>
        </div>
        <div className="mt-4 flex items-center">
          <div className="mr-4 flex gap-1.5 text-default-700">
            <p>Secret Token</p>
            <SecretTooltip />
          </div>
          <div className="w-1/2 ml-auto flex gap-4">
            <Input
              isRequired
              isClearable
              placeholder={serverInfo?.secret || 'Input your local auth token'}
              value={config?.[ZerotierConfig.TOKEN] || ''}
              onClear={() => onTokenChanged('')}
              onValueChange={onTokenChanged}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="mr-4 flex gap-1.5 text-default-700">
            <p>Service Port</p>
          </div>
          <div className="ml-auto flex gap-4">
            <Input
              isRequired
              isClearable
              type="number"
              placeholder={(serverInfo?.port ?? '').toString() || 'Input service port'}
              value={(config?.[ZerotierConfig.PORT] || '').toString()}
              onClear={() => onPortChanged('')}
              onValueChange={onPortChanged}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="mr-4 flex gap-1.5 text-default-700">
            <p>ZeroTier One Directory</p>
          </div>
          <div className="ml-auto flex gap-4">
            <Button className="bg-default-100" onClick={openZeroTierOneDir}>
              Open Folder
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ZerotierExperiments
