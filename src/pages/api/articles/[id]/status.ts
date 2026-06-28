import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articles } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id as string);
    const { status } = await request.json();

    if (!['draft', 'published', 'disabled'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }

    const existing = db.select().from(articles).where(eq(articles.id, id)).get();
    if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    let publishedAt = existing.publishedAt;
    if (existing.status !== 'published' && status === 'published') {
      publishedAt = new Date().toISOString();
    }

    db.update(articles).set({ 
      status, 
      publishedAt,
      updatedAt: new Date().toISOString()
    }).where(eq(articles.id, id)).run();

    return new Response(JSON.stringify({ success: true, status }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update status' }), { status: 500 });
  }
};
