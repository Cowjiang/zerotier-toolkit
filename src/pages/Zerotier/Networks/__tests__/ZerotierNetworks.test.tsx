import { fireEvent, waitFor, within } from '@testing-library/react'
import i18n from 'i18next'

import { Language } from '../../../../typings/enum.ts'
import { render } from '../../../../utils/testUtils/setupTest.tsx'
import { mockConfigIPC } from '../../../../utils/testUtils/tauriMocks.ts'
import ZerotierNetworks from '../ZerotierNetworks.tsx'

beforeEach(() => {
  mockConfigIPC()
})

afterEach(async () => {
  await i18n.changeLanguage(Language.en_US)
})

describe('ZerotierNetworks', () => {
  it('should list the networks joined by this node', async () => {
    const { getByText } = render(<ZerotierNetworks />)

    await waitFor(() => expect(getByText('882d314dd3dbd4dd')).toBeTruthy())
    expect(getByText('Cowjiang Private')).toBeTruthy()
    expect(getByText('Home Lab')).toBeTruthy()
    expect(getByText('Connected')).toBeTruthy()
    expect(getByText('Requesting')).toBeTruthy()
  })

  it('should keep the networks matching the keyword only', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ZerotierNetworks />)
    await waitFor(() => expect(getByText('Cowjiang Private')).toBeTruthy())

    fireEvent.change(getByPlaceholderText('Search by Network ID...'), { target: { value: 'Home' } })

    expect(getByText('Home Lab')).toBeTruthy()
    expect(queryByText('Cowjiang Private')).toBeNull()
  })

  it('should open the details modal by clicking a network row', async () => {
    const { findByText, getByText } = render(<ZerotierNetworks />)

    await waitFor(() => expect(getByText('882d314dd3dbd4dd')).toBeTruthy())
    fireEvent.click(getByText('882d314dd3dbd4dd'))

    expect(await findByText('Ethernet')).toBeTruthy()
  })

  it('should open the join dialog of the toolbar', async () => {
    const { getByText } = render(<ZerotierNetworks />)

    fireEvent.click(getByText('Join New'))

    await waitFor(() => expect(getByText('Join New Network')).toBeTruthy())
    expect(getByText('Enter 16-digit Network ID')).toBeTruthy()
  })

  it('should localize static labels while keeping fetched values unchanged', async () => {
    await i18n.changeLanguage(Language.zh_CN)
    const { findByRole, getByText } = render(<ZerotierNetworks />)

    await waitFor(() => expect(getByText('882d314dd3dbd4dd')).toBeTruthy())
    fireEvent.click(getByText('882d314dd3dbd4dd'))

    const modal = within(await findByRole('dialog'))

    expect(modal.getByText('网络 ID')).toBeTruthy()
    expect(modal.getByText('名称')).toBeTruthy()
    expect(modal.getByText('状态')).toBeTruthy()
    expect(modal.getByText('以太网')).toBeTruthy()
    expect(modal.getByText('设备')).toBeTruthy()
    expect(modal.getByText('类型')).toBeTruthy()
    expect(modal.getByText('允许托管地址')).toBeTruthy()
    expect(modal.getByText('允许分配全局 IP')).toBeTruthy()
    expect(modal.getByText('允许覆盖默认路由')).toBeTruthy()
    expect(modal.getByText('允许 DNS 配置')).toBeTruthy()
    expect(modal.getByText('托管地址')).toBeTruthy()
    expect(modal.getByText('托管路由')).toBeTruthy()
    expect(modal.getByText('172.24.0.0/24 经由 ethernet_32772')).toBeTruthy()
    expect(modal.getByText('OK')).toBeTruthy()
    expect(modal.getByText('PRIVATE')).toBeTruthy()
  })
})
