import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articles, articleTags } from '../../../db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { slugify, calculateReadingTime } from '../../../lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import { articleSchema } from '../../../lib/validations';

export const GET: APIRoute = async () => {
  try {
    const allArticles = db.select().from(articles).orderBy(desc(articles.createdAt)).all();
    // Join tags in memory (N+1 fix)
    const articleIds = allArticles.map(a => a.id);
    const allTagsData = articleIds.length > 0
      ? db.select().from(articleTags).where(inArray(articleTags.articleId, articleIds)).all()
      : [];
    const tagsByArticleId = allTagsData.reduce((acc, row) => {
      if (!acc[row.articleId]) acc[row.articleId] = [];
      acc[row.articleId].push(row.tag);
      return acc;
    }, {} as Record<string, string[]>);

    const result = allArticles.map(a => ({
      ...a,
      tags: tagsByArticleId[a.id] || []
    }));
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const parseResult = articleSchema.safeParse(body);
    
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: parseResult.error.issues }), { status: 400 });
    }

    const { title, slug: customSlug, description, contentHtml, contentJson, coverImageUrl, lang, category, status, featured, tags } = parseResult.data;

    const authorId = locals.user.id;
    let slug = customSlug ? customSlug : slugify(title);
    
    if (customSlug) {
      const slugExists = db.select().from(articles).where(eq(articles.slug, customSlug)).get();
      if (slugExists) {
        return new Response(JSON.stringify({ error: 'Validation failed', details: [{ path: ['slug'], message: 'Slug is already in use' }] }), { status: 400 });
      }
    } else {
      let baseSlug = slug;
      let slugExists = db.select().from(articles).where(eq(articles.slug, slug)).get();
      let counter = 1;
      while (slugExists) {
        slug = `${baseSlug}-${counter}`;
        slugExists = db.select().from(articles).where(eq(articles.slug, slug)).get();
        counter++;
      }
    }

    const cleanHtml = DOMPurify.sanitize(contentHtml);
    const readingTime = calculateReadingTime(cleanHtml);
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = db.insert(articles).values({
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
      authorId,
      publishedAt
    }).returning().get();

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        db.insert(articleTags).values({ articleId: result.id, tag }).run();
      }
    }

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return new Response(JSON.stringify({ error: 'Failed to create article' }), { status: 500 });
  }
};
