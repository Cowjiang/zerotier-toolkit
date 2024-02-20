import { useAppStore } from '../../../store/app.ts'
import { render } from '../../../utils/testUtils/setupTest.tsx'
import ThemeProvider from '../ThemeProvider.tsx'

describe('ThemeProvider', () => {
  it('should render the theme with default theme', () => {
    render(
      <ThemeProvider defaultTheme="test">
        <div></div>
      </ThemeProvider>,
    )
    const currentTheme = useAppStore.getState().config.theme?.current
    expect(currentTheme).toBe('test')
  })
})
