import { fireEvent } from '@testing-library/react'

import { render } from '../../../utils/testUtils/setupTest.tsx'
import SideMenu, { MenuListSection } from '../SideMenu.tsx'

const sections: MenuListSection[] = [
  {
    key: 'ZeroTier',
    title: 'ZeroTier',
    items: [
      { path: '/zerotier/networks', title: 'Networks' },
      { path: '/zerotier/peers', title: 'Peers' },
    ],
  },
]

describe('SideMenu', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('should render the sections and the items', () => {
    const { getByText } = render(<SideMenu items={sections} tabPath="/zerotier/networks" />)

    expect(getByText('ZeroTier')).toBeTruthy()
    expect(getByText('Networks')).toBeTruthy()
    expect(getByText('Peers')).toBeTruthy()
  })

  it('should navigate to the item clicked by the user', () => {
    const { getByText } = render(<SideMenu items={sections} tabPath="/zerotier/networks" />)

    fireEvent.click(getByText('Peers'))

    expect(window.location.pathname).toBe('/zerotier/peers')
  })
})
