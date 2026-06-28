import type { APIRoute } from 'astro';
import { db } from '../../../../../db';
import { articles, praises } from '../../../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

function getFingerprint(request: Request): string {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(`${ip}-${ua}`).digest('hex');
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.slug as string;
    const article = db.select().from(articles).where(eq(articles.slug, slug)).get();
    
    if (!article) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const fingerprint = getFingerprint(request);
    const userPraise = db.select()
      .from(praises)
      .where(and(
        eq(praises.articleId, article.id),
        eq(praises.visitorFingerprint, fingerprint)
      )).get();
    
    return new Response(JSON.stringify({ 
      praiseCount: article.praiseCount,
      hasPraised: !!userPraise
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const slug = params.slug as string;
    const article = db.select().from(articles).where(eq(articles.slug, slug)).get();
    
    if (!article) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const fingerprint = getFingerprint(request);
    const existingPraise = db.select()
      .from(praises)
      .where(and(
        eq(praises.articleId, article.id),
        eq(praises.visitorFingerprint, fingerprint)
      )).get();

    if (existingPraise) {
      return new Response(JSON.stringify({ error: 'Already praised' }), { status: 400 });
    }

    let newCount = 0;
    db.transaction(() => {
      db.insert(praises).values({ articleId: article.id, visitorFingerprint: fingerprint }).run();
      const updated = db.update(articles)
        .set({ praiseCount: sql`${articles.praiseCount} + 1` })
        .where(eq(articles.id, article.id))
        .returning({ praiseCount: articles.praiseCount })
        .get();
      newCount = updated.praiseCount;
    });

    return new Response(JSON.stringify({ 
      success: true, 
      praiseCount: newCount 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
