import { Listbox, ListboxItem, ListboxItemProps, ListboxSection, ListboxSectionProps } from '@nextui-org/react'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CommandIcon, NetworkIcon, PaintIcon, ServiceIcon, StatusIcon, WindowIcon } from '../components/base/Icon.tsx'
import AppearanceSetting from '../components/setting/AppearanceSetting.tsx'
import GeneralSetting from '../components/setting/GeneralSetting.tsx'
import ZerotierNetworks from '../components/zerotier/network/ZerotierNetworks.tsx'
import ZerotierService from '../components/zerotier/service/ZerotierService.tsx'
import ZerotierStatus from '../components/zerotier/status/ZerotierStatus.tsx'
import { TAURI_DRAG_REGION } from '../constant.ts'

type ListItem = {
  path: string
  title: string
  description?: string
  panel?: ReactElement
} & Pick<ListboxItemProps, 'children' | 'startContent'>

type ListSection = {
  items: ListItem[]
} & Partial<ListboxSectionProps<ListItem>>

const iconProps = { width: 16 }

const settingList: ListSection[] = [
  {
    key: 'ZeroTier',
    title: 'ZeroTier',
    items: [
      {
        path: '/networks',
        title: 'Networks',
        description: 'Manage ZeroTier Networks',
        startContent: <NetworkIcon {...iconProps} />,
        panel: <ZerotierNetworks />,
      },
      {
        path: '/status',
        title: 'Status',
        startContent: <StatusIcon {...iconProps} />,
        description: 'My status of ZeroTier',
        panel: <ZerotierStatus />,
      },
      {
        path: '/service',
        title: 'Service',
        startContent: <ServiceIcon {...iconProps} />,
        description: 'Manage ZeroTier Service',
        panel: <ZerotierService />,
      },
    ],
  },
  {
    key: 'Settings',
    title: 'Settings',
    showDivider: true,
    items: [
      {
        path: '/setting/appearance',
        title: 'Appearance',
        description: 'Customize the appearance of the application',
        startContent: <PaintIcon {...iconProps} />,
        panel: <AppearanceSetting />,
      },
      {
        path: '/setting/general',
        title: 'General',
        description: 'Configure general settings of the application',
        startContent: <WindowIcon {...iconProps} />,
        panel: <GeneralSetting />,
      },
    ],
  },
  {
    key: 'Others',
    title: '',
    items: [
      {
        path: '/about',
        title: 'About',
        description: '',
        startContent: <CommandIcon {...iconProps} />,
      },
    ],
  },
]

function Zerotier({ tabPath }: { tabPath?: string }) {
  const navigate = useNavigate()

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>()
  const currentListItem = useMemo(
    () =>
      settingList.flatMap(({ items }) => items).find((item) => item?.path === selectedKeys?.values().next().value) ??
      ({} as ListItem),
    [selectedKeys],
  )

  const handleSelectedKeysChange = (keys: Set<string | number> | 'all') => {
    if (keys !== 'all') {
      setSelectedKeys(keys as Set<string>)
      navigate(`${keys.values().next().value}`)
    }
  }

  useEffect(() => {
    setSelectedKeys(new Set([tabPath ?? '/networks']))
  }, [tabPath])

  return (
    <div className="w-full h-screen flex overflow-y-hidden pt-1">
      <div className="w-[220px] p-4 flex flex-col flex-shrink-0">
        <Listbox
          aria-label="Settings"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedKeys}
          hideSelectedIcon
          shouldHighlightOnFocus={false}
          onSelectionChange={handleSelectedKeysChange}
          items={settingList}
          itemClasses={{
            base: 'data-[selected=true]:bg-default data-[hover=true]:bg-default/60 text-default-800',
          }}
        >
          {({ key, title, ...section }) => (
            <ListboxSection key={key} aria-label={title} title={title} {...section}>
              {(section.items as ListItem[]).map((item) => (
                <ListboxItem key={item.path} aria-label={item.title} {...item} description="">
                  {item.title || item.children}
                </ListboxItem>
              ))}
            </ListboxSection>
          )}
        </Listbox>
      </div>
      <div className="w-full h-full flex flex-col px-6 py-4 mr-4 overflow-hidden" {...TAURI_DRAG_REGION}>
        <div className="w-full mt-1 mb-6 flex" {...TAURI_DRAG_REGION}>
          <div className="flex flex-col">
            <h1 className="font-bold text-2xl">{currentListItem.title}</h1>
            <p className="mt-1 text-sm text-default-600">{currentListItem.description}</p>
          </div>
        </div>
        <div className="w-full h-full flex flex-col overflow-y-hidden">{currentListItem.panel}</div>
      </div>
    </div>
  )
}

export default Zerotier
