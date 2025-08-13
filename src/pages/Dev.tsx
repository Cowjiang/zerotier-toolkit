import { Button } from '@heroui/react'
import { InvokeArgs } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { useNavigate } from 'react-router-dom'

import { getNetworks, getStatus } from '../services/zerotierService.ts'
import { useAppStore } from '../store/app.ts'
import { InvokeEvent } from '../typings/enum.ts'
import { HttpResponse } from '../typings/global.ts'
import { checkUpdate, invokeCommand, openUrl } from '../utils/helpers/tauriHelpers.ts'

function Dev() {
  const { restartAsAdmin } = useAppStore()
  const navigate = useNavigate()

  const invokeCommandButton = (command: string, args?: InvokeArgs) => ({
    text: `[Invoke] ${command}`,
    onPress: () => {
      invokeCommand(command, args)
        .then((res) => console.log(res))
        .catch((err) => console.error(err))
    },
  })

  const apiButton = (func: () => Promise<HttpResponse<any>>) => ({
    text: `[Api] ${func.name}`,
    onPress: async () => console.log(await func()),
  })

  const btnList = [
    invokeCommandButton(InvokeEvent.GET_ZEROTIER_SERVER_INFO),
    invokeCommandButton(InvokeEvent.HIDE_MAIN_WINDOW),
    apiButton(getNetworks),
    apiButton(getStatus),
    {
      text: 'Restart As Admin',
      onPress: restartAsAdmin,
    },
    {
      text: 'Zerotier Page',
      onPress: () => navigate('/zerotier'),
    },
    {
      text: 'Setting Page',
      onPress: () => navigate('/setting'),
    },
    {
      text: '[event] config changed',
      onPress: () => emit('event_config_change', { 'System.AutoLaunch': true }),
    },
    invokeCommandButton(InvokeEvent.GET_CONFIG),
    invokeCommandButton(InvokeEvent.PUT_CONFIG_COMMAND, { payload: JSON.stringify({ 'System.Theme': 'light' }) }),
    invokeCommandButton(InvokeEvent.SET_AUTO_LAUNCH),
    invokeCommandButton(InvokeEvent.UNSET_AUTO_LAUNCH),
    invokeCommandButton(InvokeEvent.GET_ZEROTIER_ONE_DIR),
    invokeCommandButton(InvokeEvent.OPEN_ZEROTIER_ONE_DIR),
    invokeCommandButton(InvokeEvent.GET_CONFIGURATIONS, { name: 'system' }),
    invokeCommandButton(InvokeEvent.RESET_CONFIGURATIONS, { name: 'all' }),
    invokeCommandButton(InvokeEvent.OPEN_IN_OPERATION_SYSTEM, {
      something: 'https://github.com/Cowjiang/zerotier-toolkit',
    }),
    invokeCommandButton(InvokeEvent.GET_LATEST_VERSION),
    invokeCommandButton(InvokeEvent.GET_EMBEDDING_ZEROTIER_VERSION),
    {
      text: 'open url[website]',
      onPress: async () => await openUrl('https://github.com/'),
    },
    {
      text: 'check update',
      onPress: async () => {
        const update = await checkUpdate()
        if (update) {
          console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`)
        }
      },
    },
    {
      text: 'check update and install',
      onPress: async () => {
        const update = await checkUpdate()
        if (update) {
          console.log(`found update ${update.version} from ${update.date} with notes ${update.body}`)
          let downloaded = 0
          let contentLength: number | undefined = 0
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                contentLength = event.data.contentLength
                console.log(`started downloading ${event.data.contentLength} bytes`)
                break
              case 'Progress':
                downloaded += event.data.chunkLength
                console.log(`downloaded ${downloaded} from ${contentLength}`)
                break
              case 'Finished':
                console.log('download finished')
                break
            }
          })
          console.log('update installed')
        }
      },
    },
  ]

  return (
    <div className="w-full min-h-[100vh] p-3">
      <div className="w-full flex flex-wrap gap-2">
        {btnList.map(({ text, onPress }) => (
          <Button className="flex-grow" color="default" onPress={onPress} key={text}>
            {text}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default Dev
