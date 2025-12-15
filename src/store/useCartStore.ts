import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  images?: string[]
  category?: string
  sale_price?: number
  is_new?: boolean
  stock?: number
  sizes?: string[]
  colors?: string[]
  stock_by_size?: Record<string, number>
  compare_at_price?: number
}

interface CartItem extends Product {
  quantity: number
  size?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product & { size?: string, quantity?: number }) => boolean
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string) => void
  clearCart: () => void
  toggleCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product) => {
        const items = get().items
        const { size } = product
        
        // Find existing item
        const existingItem = items.find((item) => 
          item.id === product.id && item.size === size
        )

        const currentQty = existingItem ? existingItem.quantity : 0
        const addingQty = product.quantity || 1
        // Default validation: If stock is undefined/missing in product object, 
        // we should probably allow adding (or assume 0 as per strict request).
        // Since user wants strict validation, we stick to respecting 'stock'.
        // However, we must ensure the UI passes it.
        const maxStock = product.stock !== undefined ? product.stock : 100 // Fallback if missing? No, user wants strict.
        
        // Actually, if stock is accidentally undefined, 0 blocks everything. 
        // Let's rely on the passed stock, but if it's strictly undefined, maybe 0 is correct if we trust the API.
        // But for safety against "buggy UI passing", let's handle the 0 case mostly.
        const effectiveStock = product.stock ?? 0 

        if (currentQty + addingQty > effectiveStock) {
           return false
        }

        if (existingItem) {
          set({
            items: items.map((item) =>
              (item.id === product.id && item.size === size)
                ? { ...item, quantity: item.quantity + addingQty }
                : item
            ),
            isOpen: true,
          })
        } else {
          set({ 
            items: [...items, { 
                ...product, 
                quantity: addingQty,
                size: size 
            }], 
            isOpen: true 
          })
        }
        return true
      },
      removeItem: (productId, size) => {
        set({ 
            items: get().items.filter((item) => 
                !(item.id === productId && (size ? item.size === size : true))
            ) 
        })
      },
      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }

        // Check stock
        const item = get().items.find(i => i.id === productId && i.size === size)
        if (item) {
            const maxStock = item.stock !== undefined ? item.stock : 100 // Default if missing, but should exist
            // Sliently cap or return? 
            // If the UI is smart, it won't ask for more.
            // If it does, we just block the update if it exceeds.
            if (quantity > maxStock) {
                // Do nothing (prevent update) or cap?
                // Capping is safer for sync.
                // But let's just return to prevent 'jumping' to invalid state.
                return 
            }
        }

        set({
          items: get().items.map((item) =>
            (item.id === productId && item.size === size) 
                ? { ...item, quantity } 
                : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
