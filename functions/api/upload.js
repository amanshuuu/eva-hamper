import { json, error, handleOptions, requireAdmin } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return handleOptions();

  try {
    const admin = await requireAdmin(request, env);
    if (!admin) return error('Unauthorized', 401);

    if (request.method === 'GET') {
      // Generate a signed URL for direct upload to R2
      const { name, contentType } = Object.fromEntries(new URL(request.url).searchParams);
      if (!name) return error('name query param required');

      const uploadUrl = await env.R2.createPresignedUrl({
        key: `products/${name}`,
        expiresIn: 3600, // 1 hour
        method: 'PUT',
        customHeaders: { 'Content-Type': contentType || 'image/jpeg' },
      });

      const publicUrl = `https://r2.eva-hampers.workers.dev/products/${name}`;
      return json({ uploadUrl, publicUrl });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e.message, 500);
  }
}
