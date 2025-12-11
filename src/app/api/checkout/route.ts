import { NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const { items, orderId } = await req.json();
    
    // Validate items (should also check DB for real prices in a real app)
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const preference = await createPreference(items, orderId);
    
    return NextResponse.json({ url: preference.init_point });
  } catch (error) {
    console.error('Mercado Pago Error:', error);
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}
