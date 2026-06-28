import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';



const work = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/work" }),
  schema: z.object({
    lang: z.enum(["en", "id"]).default("en"),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    role: z.string(),
    clientType: z.string(),
    projectType: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string(),
    stack: z.array(z.string()),
    featured: z.boolean().default(false),
    demoUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    coverImage: z.string().optional(),
  }),
});

export const collections = { work };
