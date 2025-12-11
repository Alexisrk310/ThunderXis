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
}

interface CartItem extends Product {
  quantity: number
  size?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product & { size?: string, quantity?: number }) => void
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
        
        // Find item with same ID AND same size (if size exists)
        const existingItem = items.find((item) => 
          item.id === product.id && item.size === size
        )

        if (existingItem) {
          set({
            items: items.map((item) =>
              (item.id === product.id && item.size === size)
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            ),
            isOpen: true,
          })
        } else {
          set({ 
            items: [...items, { 
                ...product, 
                quantity: product.quantity || 1,
                size: size 
            }], 
            isOpen: true 
          })
        }
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
