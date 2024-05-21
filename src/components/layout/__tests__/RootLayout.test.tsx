import { describe, expect } from 'vitest'

import Splash from '../../../pages/Splash.tsx'
import { useAppStore } from '../../../store/app.ts'
import { render } from '../../../utils/testUtils/setupTest.tsx'
import RootLayout from '../RootLayout.tsx'

describe('RootLayout', () => {
  it('should show splash when application starts', () => {
    const { container: layout } = render(<RootLayout />)
    const { container: splash } = render(<Splash />)
    expect(layout.innerHTML).toContain(splash.innerHTML)
  })

  it('should not show splash when showSplash is false', async () => {
    useAppStore.setState({ showSplash: false })
    const { container: layout } = render(<RootLayout />)
    const { container: splash } = render(<Splash />)
    expect(layout.innerHTML).not.toContain(splash.innerHTML)
  })
})
