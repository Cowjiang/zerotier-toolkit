import { fireEvent, render } from '@testing-library/react'
import { expect } from 'vitest'

import StatusCard, { StatusCardProps } from '../StatusCard.tsx'

describe('StatusCard', () => {
  it('should render status card properly', () => {
    const onPress = vi.fn()
    const cardProps: StatusCardProps = {
      type: 'success',
      title: 'test title',
      content: 'test content',
      onPress,
    }
    const { container } = render(<StatusCard {...cardProps} />)
    const btn = container.querySelector('button')
    btn && fireEvent.click(btn)
    expect(onPress).toBeCalled()
  })
})
