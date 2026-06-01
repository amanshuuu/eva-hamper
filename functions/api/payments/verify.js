import { json, error, handleOptions } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    if (request.method === 'POST') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return error('Missing payment verification fields');
      }

      // Verify signature using Razorpay's algorithm
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(env.RAZORPAY_KEY_SECRET);
      const msgData = encoder.encode(body);

      const key = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, msgData);
      const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');

      if (expected !== razorpay_signature) {
        return error('Invalid payment signature', 400);
      }

      return json({ verified: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
