import { Avatar, Divider, Image, Link, Listbox, ListboxItem, ListboxSection, Tooltip } from '@nextui-org/react'
import { useState } from 'react'

import { BugIcon, GithubIcon, TagsIcon } from '../components/base/Icon.tsx'
import { getAppVersion, openSomething } from '../utils/helpers/tauriHelpers.ts'

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

const githubLinks = [
  {
    title: 'Check For Updates',
    description: 'Latest releases',
    startContent: <TagsIcon width={18} />,
    // TODO : Check For Updates
    link: '',
  },
  {
    title: 'Github Repository',
    description: 'Source code',
    startContent: <GithubIcon width={18} />,
    link: 'https://github.com/Cowjiang/tauri-react-zerotier-toolkit',
  },
  {
    title: 'Report Issues',
    description: 'Report issues',
    startContent: <BugIcon width={18} />,
    link: 'https://github.com/Cowjiang/tauri-react-zerotier-toolkit/issues',
  },
]

const poweredBy = [
  {
    title: 'Tauri',
    description:
      'Tauri is a framework for building tiny, blazing fast binaries for all platforms with a single codebase.',
    link: 'https://tauri.app/',
  },
  {
    title: 'NextUI',
    description: 'A component library for building beautiful and modern web interfaces with Tailwind CSS and React.',
    link: 'https://nextui.org/',
  },
  {
    title: 'Flaticon',
    description: 'Flaticon is a free icon set.',
    link: 'https://www.flaticon.com/',
  },
]

function About() {
  const [appVersion, setAppVersion] = useState('Unknown')
  const init = async () => {
    const version = await getAppVersion()
    version && setAppVersion(version)
  }
  init().catch((_) => {})

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 items-center">
        <div className="h-[80px]">
          <Image width={80} alt="Logo" src="/zerotier_orange.svg" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="mb-1 text-2xl font-bold text-primary">ZeroTier Toolkit</h1>
          <p className="text-sm text-primary">Version: {appVersion}</p>
        </div>
      </div>
      <Divider className="mt-8 mb-4" />
      <div className="flex gap-6">
        <Listbox variant="flat" aria-label="Github links">
          <ListboxSection title="Github">
            {githubLinks.map((link) => (
              <ListboxItem
                key={link.title}
                aria-label={link.title}
                description={link.description}
                startContent={link.startContent}
                onClick={() => openSomething(link.link)}
              >
                {link.title}
              </ListboxItem>
            ))}
          </ListboxSection>
        </Listbox>
        <Listbox variant="flat" aria-label="Developers">
          <ListboxSection title="Developers">
            {developers.map((user) => (
              <ListboxItem key={user.userId} aria-label={user.name} onClick={() => openSomething(user.link)}>
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
                <Tooltip content={item.description} placement={'bottom-start'}>
                  <Link size="sm" showAnchorIcon className={'cursor-pointer'} onClick={() => openSomething(item.link)}>
                    {item.title}
                  </Link>
                </Tooltip>
                {index < poweredBy.length - 1 && ' / '}
              </span>
            ))}
          </span>
          <span> following MIT License</span>
        </p>
      </div>
    </div>
  )
}

export default About
