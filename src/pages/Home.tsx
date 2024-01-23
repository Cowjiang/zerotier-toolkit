import { Button, useDisclosure } from '@nextui-org/react'
import classNames from 'classnames'
import { ServiceStatus } from '../typings/enum.ts'
import { useAppStore } from '../store/app.ts'
import { useZeroTierStore } from '../store/zerotier.ts'
import { HistoryIcon } from '../components/Icon.tsx'
import LogsModal from '../components/LogsModal.tsx'
import { useState } from 'react';

function Home() {
  const {isAdmin} = useAppStore()
  const {serviceState, startService, stopService} = useZeroTierStore()

  const {isOpen: isModalOpen, onOpen: onModalOpen, onOpenChange: onModalOpenChange} = useDisclosure()

  const [loading, setLoading] = useState(false)

  const handleServiceBtnClick = async () => {
    setLoading(true)
    await (serviceState === ServiceStatus.RUNNING ? stopService() : startService())
    setLoading(false)
  }

  const disabled = loading || !isAdmin

  const serviceButton = (
    <Button
      className={classNames([
        'w-40 bg-gradient-to-tr text-white shadow-lg',
        serviceState === ServiceStatus.RUNNING ? 'bg-none bg-red-800' : 'from-pink-500 to-yellow-500',
        disabled ? 'bg-none bg-default-100 text-default-400 shadow-none cursor-not-allowed' : ''
      ])}
      size="lg"
      disabled={disabled}
      isLoading={loading}
      onClick={handleServiceBtnClick}
    >
      {loading ? '' : serviceState === ServiceStatus.RUNNING ? 'Stop Service' : 'Start Service'}
    </Button>
  )

  return (
    <div className="w-full mt-28 flex flex-col justify-center items-center">
      <h1
        className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f02fc2] to-[#6094ea]">
        ZeroTier Toolkit
      </h1>

      <div className="w-full mt-4 flex justify-center">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>

      <p className="mt-4 font-bold text-default-700">Build with Tauri, Vite, React, Next UI and Tailwind CSS</p>

      <div className="w-full mt-5 flex justify-center items-center">
        {serviceButton}
        <Button
          className="ml-2 bg-default-100 hover:bg-default-200 text-default-700"
          size="lg"
          isIconOnly
          onClick={onModalOpen}
        >
          <HistoryIcon />
        </Button>
      </div>

      <LogsModal
        isOpen={isModalOpen}
        backdrop="blur"
        onOpenChange={onModalOpenChange}
      />
    </div>
  )
}

export default Home
