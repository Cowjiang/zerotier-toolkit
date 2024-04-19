import { render } from '../../utils/testUtils/setupTest.tsx'
import Setting from '../Setting.tsx'

describe('SettingPage', () => {
  it('should render the list of setting items', async () => {
    const { getByRole } = render(<Setting />)
    const { children } = getByRole('listbox')
    expect(children.length).toBeGreaterThanOrEqual(2)
  })
})
