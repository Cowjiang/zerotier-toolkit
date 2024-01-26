import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { Image, Spinner } from '@nextui-org/react'
import { useAppStore } from '../store/app'
import { SPLASH_SCREEN_DELAY } from '../../constant'

function Splash() {
  const navigate = useNavigate()

  const {isLoading} = useAppStore()

  const [showSplash, setShowSplash] = useState(true)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_SCREEN_DELAY)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && !showSplash) {
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
        showLoading ? 'scale-85 -translate-y-12' : ''
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
      <div className="h-0">
        {
          <Spinner
            size="md"
            className={classNames([
              'transition-opacity delay-500',
              showLoading ? 'opacity-100' : 'opacity-0'
            ])}
            color="warning"
          />
        }
      </div>
    </motion.div>
  )
}

export default Splash
