import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().max(500),
  contentHtml: z.string(),
  contentJson: z.any(),
  coverImageUrl: z.string().nullable().optional(),
  lang: z.enum(['en', 'id']),
  category: z.string(),
  status: z.enum(['draft', 'published', 'disabled']),
  featured: z.boolean(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
});
