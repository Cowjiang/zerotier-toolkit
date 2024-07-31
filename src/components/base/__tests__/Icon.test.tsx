import { render } from '../../../utils/testUtils/setupTest.tsx'
import * as Icons from '../Icon.tsx'

describe('Icon', () => {
  it('should render icons', () => {
    Object.values(Icons).map((Icon) => {
      const { container } = render(<Icon />)
      expect(container.querySelector('svg')).not.toBeNull()
    })
  })
})
