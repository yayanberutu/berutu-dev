import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const { url, request, cookies, redirect } = context;
  const path = url.pathname;

  // Protected routes: /admin/* (except /admin/login) and /api/articles/*
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';
  const isApiArticleRoute = path.startsWith('/api/articles');

  // CSRF Check
  if (request.method !== 'GET' && (path.startsWith('/admin') || path.startsWith('/api/articles'))) {
    const origin = request.headers.get('origin') || request.headers.get('referer');
    if (!origin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Missing Origin/Referer' }), { status: 403 });
    }
    try {
      const originHost = new URL(origin).host;
      const requestHost = url.host;
      if (originHost !== requestHost) {
        return new Response(JSON.stringify({ error: 'Forbidden: CSRF check failed' }), { status: 403 });
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Forbidden: Invalid Origin/Referer' }), { status: 403 });
    }
  }

  if (isAdminRoute || isApiArticleRoute) {
    const token = cookies.get('auth_token')?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      if (isAdminRoute) {
        return redirect('/admin/login');
      }
      if (isApiArticleRoute) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Attach user to locals
    context.locals.user = user;
  }

  return next();
});
