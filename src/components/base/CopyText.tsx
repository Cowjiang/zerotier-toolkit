import { Tooltip } from '@heroui/react'
import classNames from 'classnames'
import { ReactNode, useState } from 'react'

import { copyToClipboard } from '../../utils/helpers/tauriHelpers.ts'
import { Trans } from 'react-i18next'

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
    <Tooltip isOpen={isOpen} content={<Trans>Copied</Trans>} color="foreground" closeDelay={750} placement="right">
      <div className={classNames('w-fit cursor-pointer hover:brightness-75', className)} onClick={handleCopy}>
        {children}
      </div>
    </Tooltip>
  )
}

export default CopyText
