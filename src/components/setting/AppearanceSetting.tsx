import { Button, Divider, Switch } from '@nextui-org/react'
import { useTheme } from 'next-themes'

import { Theme } from '../../typings/enum.ts'
import { CheckIcon, DarkThemeIcon, LightThemeIcon } from '../base/Icon.tsx'

function AppearanceSetting() {
  const { theme, setTheme } = useTheme()
  const switchTheme = (theme: Theme) => setTheme(theme)

  return (
    <div className="flex flex-col">
      <div>
        <p className="font-bold text-large">Theme</p>
      </div>
      <div className="mt-4 flex items-center">
        <p className="text-default-700">Sync with system</p>
        <div className="ml-auto flex gap-4">
          <Switch size="sm" color="primary" aria-label="Sync with system theme" />
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
