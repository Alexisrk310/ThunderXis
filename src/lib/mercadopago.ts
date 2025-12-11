import MercadoPagoConfig, { Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
});

export const createPreference = async (items: { id: string; name: string; quantity: number; price: number }[], orderId: string) => {
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: items.map(item => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: Number(item.price),
        currency_id: 'COP' // Colombia Currency
      })),
      external_reference: orderId, // Link payment to order
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cart/pending`,
      },
      auto_return: 'approved',
    }
  });

  return response;
};
