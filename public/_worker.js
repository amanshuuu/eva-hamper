const ADMIN_PASSWORD = 'admin123';
const COOKIE_NAME = 'admin_auth';
const COOKIE_VALUE = 'true';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (!pathname.startsWith('/admin')) {
      return serveAsset(request, env);
    }

    const cookies = request.headers.get('Cookie') || '';
    if (cookies.includes(`${COOKIE_NAME}=${COOKIE_VALUE}`)) {
      return serveAsset(request, env);
    }

    if (pathname === '/admin' && request.method === 'POST') {
      const formData = await request.formData();
      const password = formData.get('password');
      if (password === ADMIN_PASSWORD) {
        const response = Response.redirect(`${url.origin}/admin/dashboard`, 302);
        response.headers.set('Set-Cookie', `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
        return response;
      }
      return new Response(LOGIN_PAGE.replace('{{error}}', 'Incorrect password'), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      });
    }

    return new Response(LOGIN_PAGE.replace('{{error}}', ''), {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    });
  },
};

async function serveAsset(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (response.status === 404) {
    const url = new URL(request.url);
    const spaReq = new Request(`${url.origin}/index.html`, request);
    return env.ASSETS.fetch(spaReq);
  }
  return response;
}

const LOGIN_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>EVA Admin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f0eb;font-family:-apple-system,sans-serif;padding:16px}
.card{background:#fff;padding:40px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);width:100%;max-width:360px;text-align:center}
h1{font-family:Georgia,serif;color:#a67c52;font-size:22px;margin-bottom:4px}
h2{font-size:16px;color:#888;margin-bottom:24px;font-weight:600}
form{display:flex;flex-direction:column;gap:12px}
input{height:48px;border:1px solid #ddd;border-radius:8px;padding:0 16px;font-size:15px}
button{height:48px;background:#a67c52;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
button:hover{background:#8b6b43}
.error{color:#c0392b;font-size:13px}
</style>
</head>
<body>
<div class="card">
<h1>EVA</h1>
<h2>Admin Login</h2>
<form method="POST" action="/admin/login">
<input type="password" name="password" placeholder="Admin password" autofocus required>
<p class="error">{{error}}</p>
<button type="submit">Login</button>
</form>
</div>
</body>
</html>`;
