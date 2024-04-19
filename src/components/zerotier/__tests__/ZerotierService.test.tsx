import { fireEvent, waitFor } from '@testing-library/react'

import { useAppStore } from '../../../store/app.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import { ServiceStartType, ServiceStatus } from '../../../typings/enum.ts'
import { render } from '../../../utils/testUtils/setupTest.tsx'
import ZerotierService from '../ZerotierService.tsx'

describe('ZerotierService', () => {
  it('should display the status button and be able to start service', () => {
    const startService = vi.fn()
    useAppStore.setState({
      isAdmin: true,
    })
    useZeroTierStore.setState({
      serviceState: ServiceStatus.STOPPED,
      startService,
    })
    const { getByText } = render(<ZerotierService />)
    waitFor(() => {
      const statusButton = getByText(ServiceStatus.STOPPED)
      fireEvent.click(statusButton)
    })
    expect(startService).toBeCalled()
  })

  it('should display the start type selector', () => {
    const setServiceStartType = vi.fn()
    useAppStore.setState({
      isAdmin: true,
    })
    useZeroTierStore.setState({
      serviceState: ServiceStatus.STOPPED,
      serviceStartType: ServiceStartType.DEMAND_START,
      setServiceStartType,
    })
    const { getByTestId } = render(<ZerotierService />)
    const selector = getByTestId('hidden-select-container').querySelector('select') as HTMLSelectElement
    expect(selector.value).toBe(ServiceStartType.DEMAND_START)
  })

  it('should disable the buttons if user is not admin', () => {
    const startService = vi.fn()
    useAppStore.setState({
      isAdmin: false,
    })
    useZeroTierStore.setState({
      serviceState: ServiceStatus.RUNNING,
      startService,
    })
    const { getByText } = render(<ZerotierService />)
    const statusButton = getByText(ServiceStatus.RUNNING) as HTMLButtonElement
    expect(statusButton.disabled).toBeTruthy()
    fireEvent.click(statusButton)
    expect(startService).not.toBeCalled()
  })

  it('should show restart warning button if user is not admin', () => {
    const restartAsAdmin = vi.fn()
    useAppStore.setState({
      isAdmin: false,
      restartAsAdmin,
    })
    const { getByText } = render(<ZerotierService />)
    const restartButton = getByText('Please click here to relaunch as Administrator for management')
    fireEvent.click(restartButton)
    expect(restartAsAdmin).toBeCalled()
  })
})
