import { Listbox, ListboxItem, ListboxItemProps, ListboxSection, ListboxSectionProps } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { useLanguage } from '../providers/LanguageProvider.tsx'

export type MenuListItem = {
  path: string
  title: string
  description?: string
} & Pick<ListboxItemProps, 'children' | 'startContent'>

export type MenuListSection = {
  items: MenuListItem[]
  path?: string
} & Partial<ListboxSectionProps<MenuListItem>>

function SideMenu({ tabPath, items }: { tabPath?: string; items: MenuListSection[] }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>()

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
    <div className="w-[220px] p-4 flex flex-col flex-shrink-0">
      <Listbox
        key={language}
        aria-label="Navigation"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        hideSelectedIcon
        shouldHighlightOnFocus={false}
        onSelectionChange={handleSelectedKeysChange}
        items={items}
        itemClasses={{
          base: 'data-[selected=true]:bg-default data-[hover=true]:bg-default/60 text-default-800'
        }}
      >
        {({ key, title, ...section }) => (
          <ListboxSection key={key} aria-label={title} title={t(title as string)} {...section}>
            {({ title, ...item }) => (
              <ListboxItem
                key={item.path}
                aria-label={title}
                {...item}
                description=""
              >
                <Trans>{title || item.children}</Trans>
              </ListboxItem>
            )}
          </ListboxSection>
        )}
      </Listbox>
    </div>
  )
}

export default SideMenu
