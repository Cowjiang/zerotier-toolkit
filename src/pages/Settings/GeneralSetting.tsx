import { Switch } from '@nextui-org/react'
import { useEffect } from 'react'

import { useAppStore } from '../../store/app.ts'
import { GeneralConfig } from '../../typings/config.ts'

function GeneralSetting() {
  const { config, setConfig } = useAppStore()

  useEffect(() => {
    if (!config[GeneralConfig.ENABLE_TRAY] && config[GeneralConfig.MINIMIZE_TO_TRAY]) {
      setConfig({ [GeneralConfig.MINIMIZE_TO_TRAY]: false })
    }
  }, [config[GeneralConfig.ENABLE_TRAY]])

  useEffect(() => {
    if (config[GeneralConfig.MINIMIZE_TO_TRAY] && !config[GeneralConfig.ENABLE_TRAY]) {
      setConfig({ [GeneralConfig.ENABLE_TRAY]: true })
    }
  }, [config[GeneralConfig.MINIMIZE_TO_TRAY]])

  return (
    <div className="flex flex-col">
      <section>
        <div>
          <p className="font-bold text-large">Window</p>
        </div>
        <div className="mt-4 flex items-center">
          <p className="text-default-700">Launch ZeroTier Toolkit when start-up</p>
          <div className="ml-auto flex gap-4">
            <Switch
              aria-label="Launch ZeroTier Toolkit when start-up"
              size="sm"
              color="primary"
              isSelected={!!config[GeneralConfig.AUTO_START]}
              onValueChange={(v) => setConfig({ [GeneralConfig.AUTO_START]: v })}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-col">
            <p className="text-default-700">Enable the tray icon</p>
            <small className="text-tiny text-default-600">
              If disabled, the application will exit when closing the window
            </small>
          </div>
          <div className="ml-auto flex gap-4">
            <Switch
              aria-label="Enable the tray icon"
              size="sm"
              color="primary"
              isSelected={!!config[GeneralConfig.ENABLE_TRAY]}
              onValueChange={(v) => setConfig({ [GeneralConfig.ENABLE_TRAY]: v })}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <p className="text-default-700">Minimize to system tray on launching</p>
          <div className="ml-auto flex gap-4">
            <Switch
              aria-label="Minimize to system tray on launching"
              size="sm"
              color="primary"
              isSelected={!!config[GeneralConfig.MINIMIZE_TO_TRAY]}
              onValueChange={(v) => setConfig({ [GeneralConfig.MINIMIZE_TO_TRAY]: v })}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default GeneralSetting
