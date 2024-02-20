import { Button, Divider, Switch } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { UseThemeProps } from 'next-themes/dist/types'

import { useAppStore } from '../../store/app.ts'
import { Theme } from '../../typings/enum.ts'
import { CheckIcon, DarkThemeIcon, LightThemeIcon } from '../base/Icon.tsx'

function AppearanceSetting() {
  const { theme, setTheme } = useTheme() as { theme: Theme } & UseThemeProps
  const switchTheme = (theme: Theme) => {
    syncWithSystemTheme(false).then(() => setTheme(theme))
  }

  const { config, setConfig } = useAppStore()
  const syncWithSystemTheme = async (isSyncWithSystem: boolean) => {
    setConfig({ theme: { isSyncWithSystem, current: theme } })
  }

  return (
    <div className="flex flex-col">
      <div>
        <p className="font-bold text-large">Theme</p>
      </div>
      <div className="mt-4 flex items-center">
        <p className="text-default-700">Sync with system</p>
        <div className="ml-auto flex gap-4">
          <Switch
            aria-label="Sync with system theme"
            size="sm"
            color="primary"
            isSelected={config.theme?.isSyncWithSystem}
            onValueChange={(v) => syncWithSystemTheme(v)}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <p className="text-default-700">Switch theme</p>
        <div className="ml-auto flex gap-3">
          <div className="flex flex-col items-center">
            <Button
              aria-label="Dark Theme"
              className="w-[96px] h-[72px] p-0 flex justify-center items-center"
              onPress={() => switchTheme(Theme.DARK)}
            >
              <div>
                <DarkThemeIcon />
              </div>
              {theme === Theme.DARK && <CheckIcon className="absolute text-primary" width={20} />}
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Button
              aria-label="Light Theme"
              className="w-[96px] h-[72px] p-0 flex justify-center items-center relative"
              onPress={() => switchTheme(Theme.LIGHT)}
            >
              <div>
                <LightThemeIcon />
              </div>
              {theme === Theme.LIGHT && <CheckIcon className="absolute text-primary" width={20} />}
            </Button>
          </div>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default AppearanceSetting
