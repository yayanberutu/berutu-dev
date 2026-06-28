export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const noHtml = text.replace(/<[^>]*>?/gm, '');
  const words = noHtml.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
