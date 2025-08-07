import { Button } from '@heroui/react'
import { InvokeArgs } from '@tauri-apps/api/core'
import { emit } from '@tauri-apps/api/event'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getNetworks, getStatus } from '../services/zerotierService.ts'
import { useAppStore } from '../store/app.ts'
import { InvokeEvent } from '../typings/enum.ts'
import { HttpResponse } from '../typings/global.ts'
import { invokeCommand } from '../utils/helpers/tauriHelpers.ts'

function Dev() {
  const { restartAsAdmin } = useAppStore()
  const navigate = useNavigate()
  const [assList, setAssList] = useState<JSX.Element[]>([])

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
  ]

  function ass(): JSX.Element {
    return (
      <motion.div
        className={'absolute top-0 font-bold'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: 1.2, y: -10 }}
        exit={{ opacity: 0 }}
      >
        kiss my ass!
      </motion.div>
    )
  }

  const kissMyAssBtn = (
    <div className={'relative'}>
      <Button
        onPress={() => {
          const newAssList = [...assList]
          newAssList.push(ass())
          setAssList(newAssList)
          setTimeout(() => {
            const newAssList = [...assList]
            newAssList.shift()
            setAssList(newAssList)
          }, 1000)
        }}
        size="lg"
        className="flowing-gradient bg-gradient-to-r from-[#f02fc2] to-[#6094ea]  font-bold py-2 px-4 m-1 relative"
      >
        🤩
      </Button>
      {assList.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  )

  return (
    <div className="w-full min-h-[100vh] p-3">
      <div className="flex flex-row justify-center">
        <img src="/zerotier.png" className="w-40" />
      </div>
      <div className="w-full mt-5 flex flex-wrap ">
        {btnList.map(({ text, onPress }) => (
          <Button size="lg" className="font-bold mt-2 ml-2 flex-grow" color="primary" onPress={onPress} key={text}>
            {text}
          </Button>
        ))}
        {kissMyAssBtn}
      </div>
    </div>
  )
}

export default Dev
