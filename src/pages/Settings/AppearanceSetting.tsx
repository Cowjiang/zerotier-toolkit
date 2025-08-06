import { Button, Divider, Select, SelectItem, Switch } from '@heroui/react'
import { useTheme, UseThemeProps } from 'next-themes'
import { useMemo } from 'react'

import { CheckIcon, DarkThemeIcon, LightThemeIcon } from '../../components/base/Icon.tsx'
import { useAppStore } from '../../store/app.ts'
import { LanguageConfig, ThemeConfig } from '../../typings/config.ts'
import { Language, Theme } from '../../typings/enum.ts'

const languages = [
  {
    label: 'English(US)',
    value: Language.en_US,
  },
  {
    label: '简体中文',
    value: Language.zh_CN,
  },
]

function AppearanceSetting() {
  const { theme, setTheme } = useTheme() as { theme: Theme } & UseThemeProps
  const switchTheme = (theme: Theme) => {
    syncWithSystemTheme(false).then(() => setTheme(theme))
  }

  const { config, setConfig } = useAppStore()
  const syncWithSystemTheme = async (isSyncWithSystem: boolean) => {
    setConfig({
      [ThemeConfig.IS_SYNC_WITH_SYSTEM]: isSyncWithSystem,
      [ThemeConfig.CURRENT]: theme,
    })
  }

  const currentLanguage = useMemo(() => {
    try {
      let currentLang = config[LanguageConfig.UI] ?? languages[0].value
      if (!languages.map(({ value }) => value).find((lang) => lang === currentLang)) {
        currentLang = languages[0].value
      }
      return new Set([currentLang])
    } catch (_) {
      return new Set([languages[0].value])
    }
  }, [config[LanguageConfig.UI]])

  return (
    <div className="flex flex-col">
      <section>
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
              isSelected={!!config[ThemeConfig.IS_SYNC_WITH_SYSTEM]}
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
      </section>
      <Divider className="mt-8 mb-6" />
      <section>
        <div>
          <p className="font-bold text-large">Language</p>
        </div>
        <div className="mt-4 flex items-center">
          <p className="text-default-700">Display Language</p>
          <div className="ml-auto flex gap-4">
            <Select
              className="w-36"
              label="Select language"
              labelPlacement="outside"
              classNames={{ label: 'hidden', base: '!mt-0' }}
              selectionMode="single"
              selectedKeys={currentLanguage}
              items={languages}
              onSelectionChange={(keys) => {
                setConfig({ [LanguageConfig.UI]: keys === 'all' ? languages[0].value : keys.values().next().value })
              }}
            >
              {(language) => <SelectItem key={language.value}>{language.label}</SelectItem>}
            </Select>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AppearanceSetting
