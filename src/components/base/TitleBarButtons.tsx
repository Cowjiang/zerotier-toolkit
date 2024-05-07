import { Button } from '@nextui-org/react'

import { closeWindow, minimizeWindow } from '../../utils/helpers/tauriHelpers.ts'
import { CloseIcon, MinusIcon } from './Icon.tsx'

const TitleBarButtons = () => (
  <div className="w-full h-0 sticky top-7 flex gap-2">
    <Button
      aria-label="Minimize window"
      className="ml-auto"
      variant="flat"
      isIconOnly
      radius="md"
      size="sm"
      onPress={minimizeWindow}
    >
      <MinusIcon width={16} />
    </Button>
    <Button
      aria-label="Close window"
      className="mr-10 bg-danger/90 text-danger-foreground"
      isIconOnly
      radius="md"
      size="sm"
      onPress={closeWindow}
    >
      <CloseIcon />
    </Button>
  </div>
)

export default TitleBarButtons
