import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Button, Image, Spinner } from '@nextui-org/react'
import { useAppStore } from '../store/app'
import { useZeroTierStore } from '../store/zerotier.ts'
import { SPLASH_SCREEN_DELAY } from '../../constant'
import { ServiceStatus } from '../typings/enum.ts'
import { useNotification } from '../components/NotificationBar.tsx';

function Splash() {
  const navigate = useNavigate()

  const {isLoading, isAdmin, restartAsAdmin} = useAppStore()
  const {serviceState} = useZeroTierStore()

  const {setNotification, closeNotification} = useNotification()

  const [showSplash, setShowSplash] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [showRestartButton, setShowRestartButton] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_SCREEN_DELAY)
    return () => {
      clearTimeout(timer)
      closeNotification()
    }
  }, [])

  useEffect(() => {
    if (!showSplash && !isAdmin && serviceState !== ServiceStatus.RUNNING) {
      setShowRestartButton(true)
      setNotification({
        type: 'warning',
        children: 'Administrator privilege is required, please restart the app as Admin'
      })
    } else if (!isLoading && !showSplash) {
      navigate('/home', {replace: true})
    } else if (isLoading && !showSplash) {
      setShowLoading(true)
    }
  }, [isLoading, showSplash])

  return (
    <motion.div
      className="w-screen h-screen flex flex-col justify-center items-center"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: .5}}
    >
      <div className={classNames([
        'flex flex-col justify-center items-center ease-in-out duration-[1000ms]',
        showLoading || showRestartButton ? 'scale-85 -translate-y-12' : ''
      ])}>
        <div className="h-[130px]">
          <Image
            width={130}
            alt="Logo"
            src="/zerotier_orange.svg"
          />
        </div>
        <h1 className="mt-6 text-4xl font-black text-[#ffb541]">
          ZeroTier Toolkit
        </h1>
      </div>
      <div className="h-0 -mt-4">
        {
          showLoading && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: .5, delay: .5}}
            >
              <Spinner
                size="md"
                color="warning"
              />
            </motion.div>
          )
        }
        {
          showRestartButton && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: .5, delay: .5}}
            >
              <Button
                className="w-50 text-white font-semibold bg-red-800"
                size="lg"
                onClick={restartAsAdmin}
              >
                Restart As Admin
              </Button>
            </motion.div>
          )
        }
      </div>
    </motion.div>
  )
}

export default Splash
