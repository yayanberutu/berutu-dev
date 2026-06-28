import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('admin'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  contentHtml: text('content_html').notNull(),
  contentJson: text('content_json').notNull(),
  coverImageUrl: text('cover_image_url'),
  lang: text('lang').notNull().default('en'),
  category: text('category').notNull().default('General'),
  status: text('status').notNull().default('draft'), // draft, published, disabled
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  readingTimeMinutes: integer('reading_time_minutes').notNull().default(1),
  praiseCount: integer('praise_count').notNull().default(0),
  authorId: integer('author_id').notNull().references(() => users.id),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const articleTags = sqliteTable('article_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
}, (table) => [
  uniqueIndex('idx_article_tags_article_tag').on(table.articleId, table.tag),
  index('idx_article_tags_article').on(table.articleId),
  index('idx_article_tags_tag').on(table.tag),
]);

export const praises = sqliteTable('praises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  visitorFingerprint: text('visitor_fingerprint').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('idx_praises_article_visitor').on(table.articleId, table.visitorFingerprint),
  index('idx_praises_article').on(table.articleId),
]);
