import { Code, Input, Tooltip } from '@nextui-org/react'

import { InterrogationIcon } from '../../../components/base/Icon.tsx'
import { useZeroTierStore } from '../../../store/zerotier.ts'

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
  const { serverInfo } = useZeroTierStore()

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
            <Input isRequired placeholder="Input your local auth token" value={serverInfo?.secret ?? ''} />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="mr-4 flex gap-1.5 text-default-700">
            <p>Service Port</p>
            <SecretTooltip />
          </div>
          <div className="ml-auto flex gap-4">
            <Input
              isRequired
              type="number"
              placeholder="Input service port"
              value={(serverInfo?.port ?? '').toString()}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ZerotierExperiments
