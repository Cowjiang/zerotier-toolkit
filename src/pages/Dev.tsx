import { Button } from '@nextui-org/react'
import { Response } from '@tauri-apps/api/http'

import i18n from '../i18n/index.ts'
import { getNetworks } from '../services/zerotierService.ts'
import { invokeCommand, readTextFile, writeTextFile } from '../utils/tauriHelpers.ts'
import { useAppStore } from '../store/app.ts'
import { useTheme } from 'next-themes'

function Dev() {
  const { restartAsAdmin } = useAppStore()
  const { theme, setTheme } = useTheme()

  async function readConfiguration() {
    return await readTextFile()
  }

  async function writeConfiguration(content: string) {
    await writeTextFile(content)
  }

  const invokeCommandButton = (command: string) => ({
    text: `[Invoke] ${command}`,
    onClick: () => {
      invokeCommand(command)
        .then((res) => console.log(res))
        .catch((err) => console.error(err))
    }
  })

  const apiButton = (func: () => Promise<Response<any>>) => ({
    text: `[Api] ${func.name}`,
    onClick: async () => console.log(await func())
  })

  const btnList = [
    invokeCommandButton('get_config'),
    invokeCommandButton('get_zerotier_server_info'),
    apiButton(getNetworks),
    {
      text: '[i18n]: translation',
      onClick: () => console.log(`hello => ${i18n.t('hello')}`)
    },
    {
      text: 'Restart As Admin',
      onClick: restartAsAdmin
    },
    {
      text: 'Theme Switcher',
      onClick: () => setTheme(theme === 'light' ? 'dark' : 'light')
    },
    {
      text: '[fs] read configuration file',
      onClick: async () => {
        console.log(await readConfiguration())
      },
    },
    {
      text: '[fs] write configuration file',
      onClick: async () => {
        const configuration = await readConfiguration()
        console.log('read', configuration)
        const testWriteContent = 'hello'
        console.log('write', testWriteContent)
        await writeConfiguration(testWriteContent)
        const afterWriteContent = await readConfiguration()
        console.log('read', afterWriteContent)
        console.log('write', configuration)
        await writeConfiguration(configuration)
        const recoverContent = await readConfiguration()
        console.log('read', recoverContent)
      },
    },
  ]

  return (
    <div className="w-full">
      <div className="mt-28 grid grid-cols-auto gap-4 p-3">
        {btnList.map(({ text, onClick }) => (
          <Button onClick={onClick} key={text}>
            {text}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default Dev
