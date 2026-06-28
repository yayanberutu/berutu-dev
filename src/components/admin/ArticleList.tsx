import React, { useEffect, useState } from 'react';

export default function ArticleList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/articles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article permanently?')) return;
    
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error('Failed to delete article', err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading articles...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        <a 
          href="/admin/articles/new" 
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + New Article
        </a>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-3 px-4 font-semibold text-sm">Title</th>
                <th className="py-3 px-4 font-semibold text-sm">Status</th>
                <th className="py-3 px-4 font-semibold text-sm">Language</th>
                <th className="py-3 px-4 font-semibold text-sm">Praise</th>
                <th className="py-3 px-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No articles found. Create your first one!
                  </td>
                </tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{article.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.description}</div>
                      <div className="flex gap-1 mt-2">
                        {article.tags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">#{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select 
                        value={article.status}
                        onChange={(e) => handleStatusChange(article.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded border outline-none cursor-pointer ${
                          article.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          article.status === 'disabled' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-mono uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">{article.lang}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      👏 {article.praiseCount}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`/admin/articles/${article.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                        >
                          Edit
                        </a>
                        <button 
                          onClick={() => handleDelete(article.id)}
                          className="px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded hover:bg-destructive/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
