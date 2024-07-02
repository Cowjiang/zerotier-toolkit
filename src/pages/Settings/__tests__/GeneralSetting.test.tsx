import { fireEvent } from '@testing-library/react'

import { useAppStore } from '../../../store/app.ts'
import { GeneralConfig } from '../../../typings/config.ts'
import { render } from '../../../utils/testUtils/setupTest.tsx'
import GeneralSetting from '../GeneralSetting.tsx'

describe('GeneralSetting', () => {
  it('should enable tray icon if MINIMIZE_TO_TRAY is enabled', () => {
    useAppStore.setState({
      config: {
        [GeneralConfig.ENABLE_TRAY]: false,
        [GeneralConfig.MINIMIZE_TO_TRAY]: false,
      },
    })
    const { getByLabelText } = render(<GeneralSetting />)
    const minimizeToTraySwitcher = getByLabelText('Minimize to system tray on launching')
    fireEvent.click(minimizeToTraySwitcher)
    expect(useAppStore.getState().config[GeneralConfig.ENABLE_TRAY]).toBeTruthy()
    expect(useAppStore.getState().config[GeneralConfig.MINIMIZE_TO_TRAY]).toBeTruthy()
  })

  it('should disable MINIMIZE_TO_TRAY if tray icon is disabled', () => {
    useAppStore.setState({
      config: {
        [GeneralConfig.ENABLE_TRAY]: true,
        [GeneralConfig.MINIMIZE_TO_TRAY]: true,
      },
    })
    const { getByLabelText } = render(<GeneralSetting />)
    const enableTraySwitcher = getByLabelText('Enable the tray icon')
    fireEvent.click(enableTraySwitcher)
    expect(useAppStore.getState().config[GeneralConfig.ENABLE_TRAY]).toBeFalsy()
    expect(useAppStore.getState().config[GeneralConfig.MINIMIZE_TO_TRAY]).toBeFalsy()
  })
})
