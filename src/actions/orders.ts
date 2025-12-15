'use server'

import { createClient } from '@/lib/supabase/server'
import { sendOrderStatusEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

import { logActivity } from '@/lib/dashboard-logger'

export async function updateOrderStatus(orderId: string, status: string, carrier?: string, trackingNumber?: string) {
  const supabase = await createClient()

  try {
    // 1. Check authentication/authorization (Basic check if user exists, refined RBAC should be in middleware/policies)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 2. Update Order
    const updateData: any = { status: status }
    if (carrier) updateData.carrier = carrier
    if (trackingNumber) updateData.tracking_number = trackingNumber

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return { success: false, error: updateError.message + (updateError.details ? ` (${updateError.details})` : '') }
    }

    // Fetch items separately to avoid ambiguous relationship errors
    // Also fetch product details for email
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, products(name, image_url)')
        .eq('order_id', orderId)
    
    // Map items to structure expected by email template
    const formattedItems = (orderItems || []).map((item: any) => ({
        name: item.products?.name || 'Producto',
        size: item.size || 'N/A', // Assuming size is on order_items, otherwise fallback
        quantity: item.quantity,
        price: item.price_at_time || item.price || 0,
        image: item.products?.image_url // In case we add images to email later
    }))

    updatedOrder.order_items = formattedItems

    // 3. Send Email
    if (status === 'shipped' && updatedOrder.customer_email) {
        // Fetch customer name
        let customerName = 'Cliente'
        if (updatedOrder.user_id) {
             const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', updatedOrder.user_id).single()
             if (profile?.full_name) customerName = profile.full_name
        }

        // Use stored language or default to 'es'
        const orderLanguage = updatedOrder.language as 'es' | 'en' | 'fr' | 'pt' || 'es'

        await sendOrderStatusEmail(
            updatedOrder.customer_email, 
            updatedOrder.id, 
            status, 
            orderLanguage, 
            carrier, 
            trackingNumber,
            customerName,
            formattedItems
        )
    }

    // 4. Log Activity
    await logActivity(
        'ORDER_UPDATE', 
        `Updated order #${orderId.slice(0, 8)} status to ${status}`, 
        { order_id: orderId, new_status: status }
    )

    // 5. Revalidate
    revalidatePath('/dashboard/orders')
    
    return { success: true }
  } catch (error) {
    console.error('Exception in updateOrderStatus:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}
