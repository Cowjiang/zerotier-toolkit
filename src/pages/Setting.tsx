import { Button, Listbox, ListboxItem, ListboxItemProps, ListboxSection, ListboxSectionProps } from '@nextui-org/react'
import { ReactElement, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CloseIcon, CodeIcon, CommandIcon, PaintIcon, TerminalIcon, WindowIcon } from '../components/base/Icon.tsx'
import AppearanceSetting from '../components/setting/AppearanceSetting.tsx'

type ListItem = {
  title: string
  description?: string
  panel?: ReactElement
} & Pick<ListboxItemProps, 'children' | 'startContent'>

type ListSection = {
  items?: ListItem[]
} & Partial<ListboxSectionProps<ListItem>>

const iconProps = { width: 16 }

const settingList: ListSection[] = [
  {
    title: 'Application',
    items: [
      {
        title: 'Appearance',
        description: 'Customize the appearance of the application',
        startContent: <PaintIcon {...iconProps} />,
        panel: <AppearanceSetting />,
      },
      {
        title: 'Window',
        startContent: <WindowIcon {...iconProps} />,
      },
      {
        title: 'Hotkeys',
        startContent: <CommandIcon {...iconProps} />,
      },
    ],
  },
  {
    title: 'ZeroTier',
    showDivider: true,
    items: [
      {
        title: 'Service',
        startContent: <TerminalIcon {...iconProps} />,
      },
    ],
  },
  {
    items: [
      {
        title: 'Development',
        startContent: <CodeIcon {...iconProps} />,
      },
    ],
  },
]

function Setting() {
  const navigate = useNavigate()

  const [selectedKeys, setSelectedKeys] = useState<Set<string | number> | 'all'>(new Set(['Appearance']))
  const currentListItem = useMemo(
    () =>
      (selectedKeys !== 'all'
        ? settingList
            .flatMap(({ items }) => items)
            .find((item) => item?.title === selectedKeys.values().next().value) ?? {}
        : {}) as ListItem,
    [selectedKeys],
  )

  return (
    <div className="w-full h-full flex">
      <div className="w-[220px] p-4 flex flex-col flex-shrink-0">
        <Listbox
          aria-label="Settings"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedKeys}
          hideSelectedIcon
          shouldHighlightOnFocus={false}
          onSelectionChange={setSelectedKeys}
          itemClasses={{
            base: 'data-[selected=true]:bg-default data-[hover=true]:bg-default/60 text-default-800',
          }}
        >
          {settingList
            .filter((s) => s.items?.length)
            .map((section, index) => (
              <ListboxSection key={section.title || `section-${index}`} aria-label={section.title} {...section}>
                {(section.items as ListItem[]).map((item) => (
                  <ListboxItem key={item.title} aria-label={item.title} {...item} description="">
                    {item.title || item.children}
                  </ListboxItem>
                ))}
              </ListboxSection>
            ))}
        </Listbox>
      </div>
      <div className="w-full flex flex-col px-6 py-4 mr-6">
        <div className="w-full mt-1 mb-4 flex items-center">
          <div className="flex flex-col">
            <h1 className="font-bold text-2xl">{selectedKeys}</h1>
            <p className="mt-1 text-sm text-default-600">{currentListItem.description}</p>
          </div>
          <Button
            className="ml-auto bg-danger/90 text-danger-foreground"
            isIconOnly
            radius="lg"
            onClick={() => navigate('/home')}
          >
            <CloseIcon />
          </Button>
        </div>
        <div className="w-full h-full mt-4 flex flex-col">{currentListItem.panel}</div>
      </div>
    </div>
  )
}

export default Setting
