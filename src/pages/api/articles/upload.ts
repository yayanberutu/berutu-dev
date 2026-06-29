import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Only allow authenticated users to upload
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Validate MIME type
    const validMimes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only PNG, JPEG, WEBP, and GIF are allowed.' }), { status: 400 });
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File size exceeds 5MB limit.' }), { status: 400 });
    }

    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `${crypto.randomUUID()}${ext}`;
    
    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'articles', yearMonth);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/articles/${yearMonth}/${filename}`;
    
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload image' }), { status: 500 });
  }
};
