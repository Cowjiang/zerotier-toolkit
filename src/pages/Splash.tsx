import { Button, Image, Spinner } from '@heroui/react'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import zerotierLogo from '../assets/zerotier_orange.svg'
import { SPLASH_SCREEN_DELAY, TAURI_DRAG_REGION } from '../constant.ts'
import { useAppStore } from '../store/app'
import { useZeroTierStore } from '../store/zerotier.ts'
import { ZerotierConfig } from '../typings/config.ts'
import { ServiceStatus } from '../typings/enum.ts'
import { Trans } from 'react-i18next'

function Splash() {
  const navigate = useNavigate()
  const { isLoading: isAppLoading, isAdmin, setShowSplash: setAppShowSplash } = useAppStore()
  const { serviceState, serverInfo, config } = useZeroTierStore()

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
    if (showSplash) {
      return
    }
    const { port, secret } = serverInfo
    const { [ZerotierConfig.PORT]: overridePort, [ZerotierConfig.TOKEN]: overrideToken } = config
    // #if WINDOWS
    if (!isAdmin && serviceState !== ServiceStatus.RUNNING) {
      setShowSetupButton(true)
      return
    }
    // #endif
    if ((!overridePort || !overrideToken) && (!port || !secret)) {
      setShowSetupButton(true)
      return
    }
    if (isAppLoading) {
      setShowLoading(true)
      return
    }
    setAppShowSplash(false)
  }, [isAppLoading, showSplash])

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
          <Image width={130} alt="Logo" src={zerotierLogo} />
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
            <Button className="min-w-48 font-semibold" color="primary" variant="flat" size="lg" onPress={setupZeroTier}>
              <Trans>Setup ZeroTier</Trans>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Splash
