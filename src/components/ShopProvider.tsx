import { type ReactNode } from 'react'
import { ShopContext, useShopState } from '@/hooks/useShop'

interface ShopProviderProps {
  children: ReactNode
}

export function ShopProvider({ children }: ShopProviderProps) {
  const shopState = useShopState()

  return (
    <ShopContext.Provider value={shopState}>
      {children}
    </ShopContext.Provider>
  )
}