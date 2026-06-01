import { json, error } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return error('Method not allowed', 405);

  try {
    const body = await request.json();
    const { level, message, stack, url } = body;

    if (!message) return error('Message required', 400);

    // Store in DB if available
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO error_logs (level, message, stack, url, user_agent, ip)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        level || 'info',
        String(message).slice(0, 1000),
        stack ? String(stack).slice(0, 5000) : '',
        url || '',
        request.headers.get('User-Agent') || '',
        request.headers.get('CF-Connecting-IP') || ''
      ).run();
    }

    return json({ ok: true });
  } catch (e) {
    return json({ ok: true }); // Silent fail — logging should never break the app
  }
}