import { fireEvent } from '@testing-library/react'

import { useAppStore } from '../../../store/app.ts'
import { Theme } from '../../../typings/enum.ts'
import { render } from '../../../utils/testUtils/setupTest.tsx'
import AppearanceSetting from '../AppearanceSetting.tsx'

beforeEach(() => {
  useAppStore.setState({ hasHydrated: true, config: { theme: { current: Theme.LIGHT, isSyncWithSystem: true } } })
})

describe('AppearanceSetting', () => {
  describe('Theme settings', () => {
    it('should be able to sync with system', () => {
      const { getByRole } = render(<AppearanceSetting />)
      const switcher = getByRole('switch')
      fireEvent.click(switcher)
      expect(useAppStore.getState().config.theme?.isSyncWithSystem).toBeFalsy()
    })
  })

  it('should stop syncing with system if change theme manually', () => {
    const { getByLabelText } = render(<AppearanceSetting />)
    const darkThemeButton = getByLabelText('Dark Theme')
    fireEvent.click(darkThemeButton)
    expect(useAppStore.getState().config.theme?.isSyncWithSystem).toBeFalsy()
  })
})
