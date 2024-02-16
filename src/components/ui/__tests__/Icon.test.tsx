import { render } from '../../../utils/testUtils/setupTest.tsx'
import { HistoryIcon } from '../Icon.tsx'

describe('Icon', () => {
  it('should render history icon', () => {
    const { getByRole } = render(<HistoryIcon />)
    expect(getByRole('icon')).toBeInTheDocument()
  })
})
