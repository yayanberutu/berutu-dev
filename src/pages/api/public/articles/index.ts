import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { articles, articleTags } from '../../../../db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') || 'en';

    const publishedArticles = db.select()
      .from(articles)
      .where(and(
        eq(articles.status, 'published'),
        eq(articles.lang, lang)
      ))
      .orderBy(desc(articles.publishedAt))
      .all();
    
    // Join tags in memory (N+1 fix)
    const articleIds = publishedArticles.map(a => a.id);
    const allTagsData = articleIds.length > 0
      ? db.select().from(articleTags).where(inArray(articleTags.articleId, articleIds)).all()
      : [];
    const tagsByArticleId = allTagsData.reduce((acc, row) => {
      if (!acc[row.articleId]) acc[row.articleId] = [];
      acc[row.articleId].push(row.tag);
      return acc;
    }, {} as Record<string, string[]>);

    const result = publishedArticles.map(a => ({
      ...a,
      tags: tagsByArticleId[a.id] || []
    }));
    
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
