import { fireEvent } from '@testing-library/react'

import { useAppStore } from '../../../store/app.ts'
import { ThemeConfig } from '../../../typings/config.ts'
import { Language, Theme } from '../../../typings/enum.ts'
import { render } from '../../../utils/testUtils/setupTest.tsx'
import AppearanceSetting from '../AppearanceSetting.tsx'

beforeEach(() => {
  useAppStore.setState({
    hasHydrated: true,
    config: {
      [ThemeConfig.CURRENT]: Theme.LIGHT,
      [ThemeConfig.IS_SYNC_WITH_SYSTEM]: true
    }
  })
})

describe('AppearanceSetting', () => {
  describe('Theme settings', () => {
    it('should be able to sync with system', () => {
      const { getByRole } = render(<AppearanceSetting />)
      const switcher = getByRole('switch')
      fireEvent.click(switcher)
      expect(useAppStore.getState().config[ThemeConfig.IS_SYNC_WITH_SYSTEM]).toBeFalsy()
    })

    it('should stop syncing with system if change theme manually', () => {
      const { getByLabelText } = render(<AppearanceSetting />)
      const darkThemeButton = getByLabelText('Dark Theme')
      fireEvent.click(darkThemeButton)
      expect(useAppStore.getState().config[ThemeConfig.IS_SYNC_WITH_SYSTEM]).toBeFalsy()
    })
  })

  describe('Language settings', () => {
    it('should be set to English by default', async () => {
      const { getByTestId } = render(<AppearanceSetting />)
      const selector = getByTestId('hidden-select-container').querySelector('select') as HTMLSelectElement
      expect(selector.value).toBe(Language.en_US)
    })
  })
})
