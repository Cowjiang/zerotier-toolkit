import { Button, Image, Spinner } from '@nextui-org/react'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SPLASH_SCREEN_DELAY, TAURI_DRAG_REGION } from '../constant.ts'
import { useAppStore } from '../store/app'
import { useZeroTierStore } from '../store/zerotier.ts'
import { ServiceStatus } from '../typings/enum.ts'

function Splash() {
  const navigate = useNavigate()
  const { isLoading, isAdmin, setShowSplash: setAppShowSplash } = useAppStore()
  const { serviceState } = useZeroTierStore()

  const [showSplash, setShowSplash] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [showSetupButton, setShowSetupButton] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, SPLASH_SCREEN_DELAY)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!showSplash && !isAdmin && serviceState !== ServiceStatus.RUNNING) {
      // #if WINDOWS
      if (!isAdmin) {
        setShowSetupButton(true)
        return
      }
      // #endif
    }
    if (!isLoading && !showSplash) {
      setAppShowSplash(false)
    } else if (isLoading && !showSplash) {
      setShowLoading(true)
    }
  }, [isLoading, showSplash])

  const setupZeroTier = () => {
    navigate('/troubleshooting')
    setAppShowSplash(false)
  }

  return (
    <motion.div
      className="w-screen h-screen flex flex-col justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      {...TAURI_DRAG_REGION}
    >
      <div
        className={classNames([
          'flex flex-col justify-center items-center ease-in-out duration-[1000ms]',
          showLoading || showSetupButton ? 'scale-85 -translate-y-12' : '',
        ])}
      >
        <div className="h-[130px]">
          <Image width={130} alt="Logo" src="/zerotier_orange.svg" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-primary">ZeroTier Toolkit</h1>
      </div>
      <div className="h-0 -mt-4">
        {showLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Spinner size="md" color="primary" />
          </motion.div>
        )}
        {showSetupButton && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Button className="min-w-48 font-semibold" color="primary" variant="flat" size="lg" onClick={setupZeroTier}>
              Setup ZeroTier
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Splash
