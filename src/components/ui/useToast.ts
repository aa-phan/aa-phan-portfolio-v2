import { createContext, useContext } from 'react'

export interface ToastApi {
  show(message: string): void
}

/** The default is a no-op so a tree rendered without the provider (unit tests) still works. */
export const ToastContext = createContext<ToastApi>({ show: () => {} })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}
