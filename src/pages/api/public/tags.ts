import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { articleTags } from '../../../db/schema';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const tags = db.select({
      tag: articleTags.tag,
      count: sql`count(*)`.as('count')
    })
    .from(articleTags)
    .groupBy(articleTags.tag)
    .orderBy(sql`count DESC`)
    .all();
    
    return new Response(JSON.stringify(tags), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
