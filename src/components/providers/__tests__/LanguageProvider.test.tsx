import { act, renderHook as renderHookBare } from '@testing-library/react'
import i18n from 'i18next'

import { useAppStore } from '../../../store/app.ts'
import { LanguageConfig } from '../../../typings/config.ts'
import { Language } from '../../../typings/enum.ts'
import { renderHook } from '../../../utils/testUtils/setupTest.tsx'
import { mockConfigIPC } from '../../../utils/testUtils/tauriMocks.ts'
import { useLanguage } from '../LanguageProvider.tsx'

beforeEach(async () => {
  mockConfigIPC()
  await i18n.changeLanguage(Language.en_US)
})

describe('LanguageProvider', () => {
  it('should switch the display language of the application', async () => {
    const { result } = renderHook(() => useLanguage())

    await act(async () => {
      await result.current.setLanguage(Language.zh_CN)
    })

    expect(i18n.language).toBe(Language.zh_CN)
    expect(useAppStore.getState().config[LanguageConfig.UI]).toBe(Language.zh_CN)
  })

  it('should fail outside of the provider', () => {
    expect(() => renderHookBare(() => useLanguage())).toThrow('useLanguage must be used within a LanguageProvider')
  })
})
