import fs from 'fs';
import path from 'path';
import { db } from '../src/db';
import { articles, articleTags, users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { calculateReadingTime } from '../src/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function parseFrontmatter(fileContent: string) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: fileContent };

  const frontmatterStr = match[1];
  const content = match[2].trim();

  const data: any = {};
  const lines = frontmatterStr.split('\n');
  
  let currentKey = '';
  for (const line of lines) {
    if (line.includes(':')) {
      const idx = line.indexOf(':');
      currentKey = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      
      // Basic array parsing for tags: ["tag1", "tag2"]
      if (val.startsWith('[')) {
        val = val.replace(/[\[\]"]/g, '');
        data[currentKey] = val.split(',').map(s => s.trim()).filter(Boolean);
      } else if (val === 'true' || val === 'false') {
        data[currentKey] = val === 'true';
      } else {
        data[currentKey] = val.replace(/^["']|["']$/g, ''); // remove quotes
      }
    }
  }

  return { data, content };
}

// Very basic Markdown to HTML for the initial migration
function markdownToHtml(md: string) {
  let html = md;
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
  // Italic
  html = html.replace(/\*(.*)\*/gim, '<i>$1</i>');
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>");
  // Paragraphs - simple wrapping
  html = html.split('\n\n').map(p => {
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol')) return p;
    return `<p>${p}</p>`;
  }).join('\n');
  return html;
}

async function migrate() {
  console.log('Starting migration...');

  // Get admin user
  const admin = db.select().from(users).where(eq(users.role, 'admin')).get();
  if (!admin) {
    console.error('No admin user found. Run seed script first.');
    return;
  }

  function processDir(dirPath: string, parentLang = 'en') {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDir(fullPath, file); // e.g. 'id'
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data, content: mdContent } = parseFrontmatter(content);
        
        const slug = file.replace(/\.mdx?$/, '');
        const existing = db.select().from(articles).where(eq(articles.slug, slug)).get();
        
        if (existing) {
          console.log(`Skipping ${slug}, already exists.`);
          continue;
        }

        const html = markdownToHtml(mdContent);
        const cleanHtml = DOMPurify.sanitize(html);
        
        // Simple TipTap JSON structure
        const contentJson = {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: mdContent }] }
          ]
        };

        const status = data.draft ? 'draft' : 'published';
        
        console.log(`Migrating ${slug}...`);
        
        const result = db.insert(articles).values({
          slug,
          title: data.title || slug,
          description: data.description || '',
          contentHtml: cleanHtml,
          contentJson: JSON.stringify(contentJson),
          coverImageUrl: data.coverImage || null,
          lang: data.lang || parentLang,
          category: data.category || 'General',
          status,
          featured: data.featured || false,
          readingTimeMinutes: calculateReadingTime(cleanHtml),
          authorId: admin!.id,
          publishedAt: status === 'published' ? (data.publishDate ? new Date(data.publishDate).toISOString() : new Date().toISOString()) : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).returning().get();

        if (data.tags && Array.isArray(data.tags)) {
          for (const tag of data.tags) {
            db.insert(articleTags).values({ articleId: result.id, tag: tag.toLowerCase() }).run();
          }
        }
      }
    }
  }

  processDir(BLOG_DIR);
  console.log('Migration complete.');
}

migrate().catch(console.error);
