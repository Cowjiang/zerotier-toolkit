import { Button } from '@heroui/react'

import { closeWindow, minimizeWindow } from '../../utils/helpers/tauriHelpers.ts'
import { CloseIcon, MinusIcon } from './Icon.tsx'

const TitleBarButtons = () => (
  <div className="w-full h-0 sticky top-4 flex gap-2">
    <Button
      aria-label="Minimize window"
      className="ml-auto"
      variant="flat"
      isIconOnly
      radius="md"
      size="sm"
      onPress={minimizeWindow}
    >
      <MinusIcon width={14} />
    </Button>
    <Button
      aria-label="Close window"
      className="mr-4 bg-danger/90 text-danger-foreground"
      isIconOnly
      radius="md"
      size="sm"
      onPress={closeWindow}
    >
      <CloseIcon width={22} />
    </Button>
  </div>
)

export default TitleBarButtons
