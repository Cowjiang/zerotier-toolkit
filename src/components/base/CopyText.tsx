import { Tooltip } from '@nextui-org/react'
import classNames from 'classnames'
import { ReactNode, useState } from 'react'

import { copyToClipboard } from '../../utils/helpers/tauriHelpers.ts'

function CopyText({
  copyValue,
  children,
  className,
}: {
  copyValue?: string | number | boolean
  children: ReactNode
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCopy = async () => {
    if (!copyValue) {
      return
    }
    setIsOpen(true)
    await copyToClipboard(String(copyValue))
    setTimeout(() => setIsOpen(false), 750)
  }

  return (
    <Tooltip isOpen={isOpen} content="Copied" color="foreground" closeDelay={750} placement="right">
      <div className={classNames('w-fit cursor-pointer hover:brightness-75', className)} onClick={handleCopy}>
        {children}
      </div>
    </Tooltip>
  )
}

export default CopyText
