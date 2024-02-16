import { waitFor } from '@testing-library/react'
import { beforeEach } from 'vitest'

import { SPLASH_SCREEN_DELAY } from '../../constant.ts'
import { useAppStore } from '../../store/app.ts'
import { useZeroTierStore } from '../../store/zerotier.ts'
import { ServiceStatus } from '../../typings/enum.ts'
import { render } from '../../utils/testUtils/setupTest.tsx'
import Splash from '../Splash.tsx'

beforeEach(() => {
  vi.mock('../../constant.ts', async (importOriginal) => {
    const mod = await importOriginal<typeof import('../../constant.ts')>()
    return {
      ...mod,
      SPLASH_SCREEN_DELAY: 0,
      namedExport: vi.fn(),
    }
  })
})

describe('SplashPage', () => {
  it('should render restart button as properly', async () => {
    useAppStore.setState({
      isLoading: false,
      isAdmin: false,
    })
    useZeroTierStore.setState({
      serviceState: ServiceStatus.STOPPED,
    })
    const { queryByText } = render(<Splash />)

    expect(queryByText('Restart As Admin')).not.toBeInTheDocument()

    await waitFor(
      () => {
        expect(queryByText('Restart As Admin')).toBeInTheDocument()
      },
      { timeout: SPLASH_SCREEN_DELAY + 500 },
    )
  })

  it('should render loading indicator as properly', async () => {
    useAppStore.setState({
      isLoading: true,
      isAdmin: true,
    })
    const { queryByLabelText } = render(<Splash />)
    await waitFor(
      () => {
        expect(queryByLabelText('Loading')).toBeInTheDocument()
      },
      { timeout: SPLASH_SCREEN_DELAY + 500 },
    )
  })

  it('should navigate to home page as properly', async () => {
    useAppStore.setState({
      isLoading: false,
      isAdmin: true,
    })
    render(<Splash />)
    await waitFor(
      () => {
        expect(window.location.href).toContain('/home')
      },
      { timeout: SPLASH_SCREEN_DELAY + 500 },
    )
  })
})
