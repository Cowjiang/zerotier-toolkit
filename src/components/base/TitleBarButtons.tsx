import { Button } from '@nextui-org/react'

import { CloseIcon, MinusIcon } from './Icon.tsx'

const TitleBarButtons = () => (
  <div className="w-full h-0 sticky top-7 flex gap-2">
    <Button aria-label="Minify" className="ml-auto" variant="flat" isIconOnly radius="md" size="sm">
      <MinusIcon width={16} />
    </Button>
    <Button aria-label="Close" className="mr-10 bg-danger/90 text-danger-foreground" isIconOnly radius="md" size="sm">
      <CloseIcon />
    </Button>
  </div>
)

export default TitleBarButtons
