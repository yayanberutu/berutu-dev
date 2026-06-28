import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articles, articleTags } from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug as string;
    const article = db.select()
      .from(articles)
      .where(and(
        eq(articles.slug, slug),
        eq(articles.status, 'published')
      )).get();
    
    if (!article) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const tags = db.select().from(articleTags).where(eq(articleTags.articleId, article.id)).all().map(t => t.tag);
    
    return new Response(JSON.stringify({ ...article, tags }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
