import { NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: Request) {
  try {
    const { items, orderId } = await req.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
       console.error("Missing MERCADO_PAGO_ACCESS_TOKEN")
       return NextResponse.json({ error: 'Server Config Error: Missing MP Token' }, { status: 500 });
    }

    // --- Server-Side Stock Validation ---
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    for (const item of items) {
        // Assuming item.id works. If your cart stores Supabase ID as 'id', this is correct.
        // Also assuming 'quantity' is passed in the item object.
        if (!item.id || !item.quantity) continue;
        if (item.id === 'shipping') continue; // Skip shipping item validation

        const { data: product, error } = await supabase
            .from('products')
            .select('stock, name')
            .eq('id', item.id)
            .single();

        if (error || !product) {
            console.error(`Product validation failed for ${item.id}`, error);
            return NextResponse.json({ error: `Product not found: ${item.title || 'Unknown'}` }, { status: 400 });
        }

        if (product.stock < item.quantity) {
            return NextResponse.json({ 
                error: `Desafortunadamente, no hay suficiente stock para ${product.name}. Disponible: ${product.stock}` 
            }, { status: 400 });
        }
    }
    // ------------------------------------

    const preference = await createPreference(items, orderId);
    
    return NextResponse.json({ url: preference.init_point });
  } catch (error: any) {
    console.error('Mercado Pago Error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed', details: error }, { status: 500 });
  }
}
