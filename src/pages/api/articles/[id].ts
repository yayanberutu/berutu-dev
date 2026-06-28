import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articles, articleTags } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { calculateReadingTime } from '../../../lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import { articleSchema } from '../../../lib/validations';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id as string);
    const article = db.select().from(articles).where(eq(articles.id, id)).get();
    
    if (!article) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

    const tags = db.select().from(articleTags).where(eq(articleTags.articleId, id)).all().map(t => t.tag);
    
    return new Response(JSON.stringify({ ...article, tags }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const id = parseInt(params.id as string);
    const body = await request.json();
    const parseResult = articleSchema.safeParse(body);
    
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: parseResult.error.issues }), { status: 400 });
    }
    const { title, slug: customSlug, description, contentHtml, contentJson, coverImageUrl, lang, category, status, featured, tags } = parseResult.data;

    const existing = db.select().from(articles).where(eq(articles.id, id)).get();
    if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    
    if (existing.authorId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not own this article' }), { status: 403 });
    }

    const cleanHtml = DOMPurify.sanitize(contentHtml);
    const readingTime = calculateReadingTime(cleanHtml);
    
    let publishedAt = existing.publishedAt;
    if (existing.status !== 'published' && status === 'published') {
      publishedAt = new Date().toISOString();
    }

    let slug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      const slugExists = db.select().from(articles).where(eq(articles.slug, customSlug)).get();
      if (slugExists && slugExists.id !== id) {
        return new Response(JSON.stringify({ error: 'Validation failed', details: [{ path: ['slug'], message: 'Slug is already in use' }] }), { status: 400 });
      }
      slug = customSlug;
    }

    db.update(articles).set({
      slug,
      title,
      description,
      contentHtml: cleanHtml,
      contentJson: JSON.stringify(contentJson),
      coverImageUrl,
      lang,
      category,
      status,
      featured,
      readingTimeMinutes: readingTime,
      publishedAt,
      updatedAt: new Date().toISOString(),
    }).where(eq(articles.id, id)).run();

    // Recreate tags
    db.delete(articleTags).where(eq(articleTags.articleId, id)).run();
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        db.insert(articleTags).values({ articleId: id, tag }).run();
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const id = parseInt(params.id as string);
    const existing = db.select().from(articles).where(eq(articles.id, id)).get();
    if (!existing) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    
    if (existing.authorId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not own this article' }), { status: 403 });
    }
    db.delete(articles).where(eq(articles.id, id)).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete' }), { status: 500 });
  }
};
