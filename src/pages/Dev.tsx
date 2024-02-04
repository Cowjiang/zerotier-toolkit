import { Button } from '@nextui-org/react'
import { Response } from '@tauri-apps/api/http'
import i18n from '../i18n/index.ts'
import { invokeCommand } from '../utils/tauriHelpers.ts'
import { getNetworks } from '../services/zerotierService.ts'

function Dev() {
  const invokeCommandButton = (command: string) => (
    {
      text: `[Invoke] ${command}`,
      onClick: () => {
        invokeCommand(command)
          .then((res) => console.log(res))
          .catch((err) => console.error(err))
      }
    }
  )

  const apiButton = (func: () => Promise<Response<any>>) => (
    {
      text: `[Api] ${func.name}`,
      onClick: async () => console.log(await func())
    }
  )

  const btnList = [
    invokeCommandButton('get_config'),
    invokeCommandButton('get_zerotier_server_info'),
    apiButton(getNetworks),
    {
      text: '[i18n]: translation',
      onClick: () => console.log(`hello => ${i18n.t('hello')}`)
    }
  ]

  return (
    <div className="w-full">
      <div className="mt-28 grid grid-cols-auto gap-4 p-3">
        {
          btnList.map(({ text, onClick }) => (
            <Button onClick={onClick} key={text}>
              {text}
            </Button>
          ))
        }
      </div>
    </div>
  )
}

export default Dev
