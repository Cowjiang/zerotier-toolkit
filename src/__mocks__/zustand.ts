import { act } from '@testing-library/react'
import * as zustand from 'zustand'

const { create: actualCreate } = await vi.importActual<typeof zustand>('zustand')

export const storeResetFns = new Set<() => void>()

const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreate(stateCreator)
  const initialState = store.getInitialState()
  storeResetFns.add(() => {
    store.setState(initialState, true)
  })
  return store
}

export const create = (<T>(stateCreator: zustand.StateCreator<T>) => {
  return typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried
}) as typeof zustand.create

afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn()
    })
  })
})
