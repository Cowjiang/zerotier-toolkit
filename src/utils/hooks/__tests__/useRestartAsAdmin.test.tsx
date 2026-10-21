import { act } from '@testing-library/react'

import { render } from '../../../utils/testUtils/setupTest.tsx'
import { mockFailingIPC } from '../../../utils/testUtils/tauriMocks.ts'
import useRestartAsAdmin from '../useRestartAsAdmin.ts'

function RestartButton() {
  const { restart } = useRestartAsAdmin()
  return <button onClick={() => restart().catch(() => {})}>restart</button>
}

describe('useRestartAsAdmin', () => {
  it('should tell the user when the restart fails', async () => {
    mockFailingIPC('failed to restart')
    const { getByText } = render(<RestartButton />)

    await act(async () => {
      getByText('restart').click()
    })

    expect(getByText('Failed to restart, please restart manually')).toBeTruthy()
  })
})
