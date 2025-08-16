import {
  Avatar,
  Chip,
  Divider,
  Image,
  Link,
  Listbox,
  ListboxItem,
  ListboxItemProps,
  ListboxSection,
  Spinner,
} from '@heroui/react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import zerotierLogo from '../assets/zerotier_orange.svg'
import { BugIcon, GithubIcon, TagsIcon } from '../components/base/Icon.tsx'
import { useAppStore } from '../store/app.ts'
import { getAppVersion, openUrl } from '../utils/helpers/tauriHelpers.ts'

const developers = [
  {
    name: 'Cowjiang',
    userId: 'Cowjiang',
    email: 'cowjiang@163.com',
    link: 'https://github.com/Cowjiang',
  },
  {
    name: 'Agitator',
    userId: 'Code-Agitator',
    email: '1482084534@qq.com',
    link: 'https://github.com/Code-Agitator',
  },
]

const poweredBy = [
  {
    title: 'Tauri',
    link: 'https://tauri.app/',
  },
  {
    title: 'HeroUI',
    link: 'https://heroui.com/',
  },
  {
    title: 'Flaticon',
    link: 'https://www.flaticon.com/',
  },
]
const iconProps = { width: 20, className: 'shrink-0' }

function About() {
  const { t } = useTranslation()
  const [appVersion, setAppVersion] = useState('Unknown')
  const init = async () => {
    setAppVersion((await getAppVersion()) || 'Unknown')
  }
  init().catch((_) => {})

  const {
    updateState: { update, downloaded, total },
    checkUpdate,
    downloadUpdate,
    installUpdate,
    resetUpdate,
  } = useAppStore()
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(false)
  const downloadProgress = total ? Math.floor((downloaded / total) * 100) : 0
  const onUpdateBtnClicked = async () => {
    if (updating) return
    setUpdating(true)
    setUpdateError(false)
    try {
      if (!update) {
        await checkUpdate()
      } else if (total !== 0 && downloaded === total) {
        await installUpdate(update)
      } else {
        await downloadUpdate(update)
      }
    } catch (e) {
      console.error('[Update]', e)
      setUpdateError(true)
      resetUpdate()
    }
    setUpdating(false)
  }

  const downloadDesc =
    downloadProgress > 0 ? (downloadProgress === 100 ? 'Click to update' : `Downloading (${downloadProgress}%)`) : ''
  const updateDesc = updating
    ? 'Checking...'
    : updateError
      ? 'Failed to get updates'
      : update
        ? 'Click to update'
        : 'Latest version'
  const appLinks: ListboxItemProps[] = [
    {
      key: 'update',
      title: update ? 'Update Available' : 'Check For Updates',
      description: downloadDesc || updateDesc,
      startContent: updating ? <Spinner size="sm" /> : <TagsIcon {...iconProps} />,
      endContent: update ? (
        <Chip size="sm" color="primary" classNames={{ content: 'text-background' }}>
          v{update.version}
        </Chip>
      ) : undefined,
      color: update ? 'primary' : 'default',
      classNames: update ? { base: 'text-primary bg-primary/15', description: 'text-primary' } : undefined,
      onPress: onUpdateBtnClicked,
    },
    {
      key: 'repo',
      title: 'Github Repository',
      description: 'Source code',
      startContent: <GithubIcon {...iconProps} />,
      onPress: () => openUrl('https://github.com/Cowjiang/tauri-react-zerotier-toolkit'),
    },
    {
      key: 'issues',
      title: 'Report Issues',
      description: 'Bug and suggestion reports',
      startContent: <BugIcon {...iconProps} />,
      onPress: () => openUrl('https://github.com/Cowjiang/tauri-react-zerotier-toolkit/issues'),
    },
  ]

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 items-center">
        <div className="h-[80px]">
          <Image width={80} alt="Logo" src={zerotierLogo} />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="mb-1 text-2xl font-bold text-primary">ZeroTier Toolkit</h1>
          <p className="text-sm text-primary">Version: {appVersion}</p>
        </div>
      </div>
      <Divider className="mt-8 mb-4" />
      <div className="flex gap-6">
        <Listbox variant="flat" aria-label="Github">
          <ListboxSection title="Zerotier Toolkit" items={appLinks}>
            {(item) => (
              <ListboxItem
                {...item}
                key={item.key}
                title={t(item.title as string)}
                description={<Trans>{item.description}</Trans>}
              />
            )}
          </ListboxSection>
        </Listbox>
        <Listbox variant="flat" aria-label="Developers">
          <ListboxSection title="Developers">
            {developers.map((user) => (
              <ListboxItem key={user.userId} aria-label={user.name} onPress={() => openUrl(user.link)}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    className="flex-shrink-0"
                    alt={user.name}
                    name={user.name.charAt(0)}
                    src={`https://github.com/${user.userId}.png`}
                    size="sm"
                    showFallback
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{user.name}</span>
                    <span className="text-tiny text-default-400">{user.email}</span>
                  </div>
                </div>
              </ListboxItem>
            ))}
          </ListboxSection>
        </Listbox>
      </div>
      <div className="mt-4 px-2 flex flex-col justify-center">
        <p className="text-sm text-foreground-400">
          <span>Powered by </span>
          <span>
            {poweredBy.map((item, index) => (
              <span key={index}>
                <Link size="sm" showAnchorIcon className="cursor-pointer" onPress={() => openUrl(item.link)}>
                  {item.title}
                </Link>
                {index < poweredBy.length - 1 && ' / '}
              </span>
            ))}
          </span>
          <span>, following MIT License</span>
        </p>
      </div>
    </div>
  )
}

export default About
