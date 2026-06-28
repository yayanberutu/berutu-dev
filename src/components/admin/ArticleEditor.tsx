import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { slugify } from '../../lib/utils';

export default function ArticleEditor({ article, mode }: { article?: any; mode: 'new' | 'edit' }) {
  const [title, setTitle] = useState(article?.title || '');
  const [description, setDescription] = useState(article?.description || '');
  const [lang, setLang] = useState(article?.lang || 'en');
  const [category, setCategory] = useState(article?.category || 'General');
  const [status, setStatus] = useState(article?.status || 'draft');
  const [featured, setFeatured] = useState(article?.featured || false);
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug);
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [draftBanner, setDraftBanner] = useState<{ timestamp: number; payload: any } | null>(null);

  const initialDataRef = useRef({
    title: article?.title || '',
    slug: article?.slug || '',
    description: article?.description || '',
    lang: article?.lang || 'en',
    category: article?.category || 'General',
    status: article?.status || 'draft',
    featured: article?.featured || false,
    coverImageUrl: article?.coverImageUrl || '',
    tags: article?.tags || [],
    contentJson: article?.contentJson || ''
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Write your story here...' }),
    ],
    content: article?.contentJson ? JSON.parse(article.contentJson) : '',
    editorProps: {
      attributes: {
        class: 'prose prose-blue focus:outline-none min-h-[500px] w-full article-content text-foreground',
      },
    },
  });

  const isDirty = () => {
    const d = initialDataRef.current;
    if (d.title !== title) return true;
    if (d.slug !== slug) return true;
    if (d.description !== description) return true;
    if (d.lang !== lang) return true;
    if (d.category !== category) return true;
    if (d.status !== status) return true;
    if (d.featured !== featured) return true;
    if (d.coverImageUrl !== coverImageUrl) return true;
    if (JSON.stringify(d.tags) !== JSON.stringify(tags)) return true;
    if (editor && d.contentJson) {
      try {
        if (JSON.stringify(editor.getJSON()) !== JSON.stringify(JSON.parse(d.contentJson))) return true;
      } catch (e) {}
    } else if (editor && !d.contentJson) {
      if (editor.getText().trim() !== '') return true;
    }
    return false;
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, slug, description, lang, category, status, featured, coverImageUrl, tags, editor?.state]);

  const draftKey = `article-draft-${article?.id ?? 'new'}`;
  
  useEffect(() => {
    const draftStr = localStorage.getItem(draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        const updatedAt = article?.updatedAt ? new Date(article.updatedAt).getTime() : 0;
        if (draft.timestamp > updatedAt) {
          setDraftBanner(draft);
        }
      } catch (e) {}
    }
  }, [draftKey, article]);

  useEffect(() => {
    if (!editor) return;
    const timeout = setTimeout(() => {
      if (isDirty()) {
        const payload = {
          title, slug, description, contentJson: JSON.stringify(editor.getJSON()),
          coverImageUrl, lang, category, status, featured, tags, slugManuallyEdited
        };
        localStorage.setItem(draftKey, JSON.stringify({ timestamp: Date.now(), payload }));
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [title, slug, description, lang, category, status, featured, coverImageUrl, tags, slugManuallyEdited, editor?.state, draftKey]);

  const handleTitleBlur = () => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title || !editor) return;
    setSaving(true);
    
    const finalStatus = publish ? 'published' : status;
    setStatus(finalStatus);

    const payload = {
      title,
      slug,
      description,
      contentHtml: editor.getHTML(),
      contentJson: editor.getJSON(),
      coverImageUrl,
      lang,
      category,
      status: finalStatus,
      featured,
      tags,
    };

    try {
      const url = mode === 'edit' ? `/api/articles/${article.id}` : '/api/articles';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem(draftKey);
        initialDataRef.current = {
          title, slug, description, lang, category, status: finalStatus, featured, coverImageUrl, tags,
          contentJson: JSON.stringify(payload.contentJson)
        };
        window.location.href = '/admin/articles';
      } else {
        const data = await res.json();
        alert('Failed to save article: ' + (data.details?.[0]?.message || data.error));
      }
    } catch (err) {
      console.error(err);
      alert('Error saving article');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addImage = () => {
    const url = window.prompt('URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null || !editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {draftBanner && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm font-medium">
            Restore unsaved draft from {new Date(draftBanner.timestamp).toLocaleString()}?
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const { payload } = draftBanner;
                setTitle(payload.title || '');
                setSlug(payload.slug || '');
                setDescription(payload.description || '');
                setLang(payload.lang || 'en');
                setCategory(payload.category || 'General');
                setStatus(payload.status || 'draft');
                setFeatured(payload.featured || false);
                setCoverImageUrl(payload.coverImageUrl || '');
                setTags(payload.tags || []);
                setSlugManuallyEdited(payload.slugManuallyEdited || false);
                if (editor && payload.contentJson) {
                  editor.commands.setContent(JSON.parse(payload.contentJson));
                }
                setDraftBanner(null);
              }}
              className="px-3 py-1.5 bg-amber-500 text-amber-950 text-xs font-bold rounded hover:bg-amber-600 transition-colors"
            >
              Restore
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem(draftKey);
                setDraftBanner(null);
              }}
              className="px-3 py-1.5 bg-transparent border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs font-bold rounded transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8">
      {/* Editor Main Area */}
      <div className="flex-1">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Article title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
          />
        </div>
        
        {/* Formatting Toolbar */}
        <div className="sticky top-[64px] z-10 flex flex-wrap gap-1 p-2 bg-background/80 backdrop-blur border-b border-border mb-6 rounded-t-lg">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bold') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><b>B</b></button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('italic') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><i>I</i></button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('strike') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><s>S</s></button>
          <div className="w-px h-6 bg-border mx-1 self-center"></div>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-sm rounded font-bold ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>H2</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1 text-sm rounded font-bold ${editor?.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>H3</button>
          <div className="w-px h-6 bg-border mx-1 self-center"></div>
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>• List</button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>1. List</button>
          <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('blockquote') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>"Quote"</button>
          <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('codeBlock') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>&lt;/&gt;</button>
          <div className="w-px h-6 bg-border mx-1 self-center"></div>
          <button onClick={setLink} className={`px-2 py-1 text-sm rounded ${editor?.isActive('link') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>🔗</button>
          <button onClick={addImage} className="px-2 py-1 text-sm rounded hover:bg-muted">🖼</button>
          <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="px-2 py-1 text-sm rounded hover:bg-muted">—</button>
        </div>

        {/* TipTap Editor */}
        <div className="min-h-[500px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Sidebar Metadata Area */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="glass p-5 rounded-xl border border-border space-y-4">
          <h3 className="font-semibold border-b border-border pb-2">Publish Settings</h3>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleSave(false)} 
              disabled={saving}
              className="flex-1 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)} 
              disabled={saving}
              className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Publish
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Language</label>
            <select value={lang} onChange={e => setLang(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md">
              <option value="en">English (EN)</option>
              <option value="id">Indonesia (ID)</option>
            </select>
          </div>
        </div>

        <div className="glass p-5 rounded-xl border border-border space-y-4">
          <h3 className="font-semibold border-b border-border pb-2">Article Metadata</h3>
          
          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">URL Slug</label>
            <input 
              type="text"
              value={slug}
              onChange={e => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md"
            />
            {slug && <p className="text-xs text-muted-foreground mt-1">Preview: /blog/{slug}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Description (SEO)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md h-20 resize-none"
              placeholder="Brief summary..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Category</label>
            <input 
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Cover Image URL</label>
            <input 
              type="text"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md"
              placeholder="/images/blog/..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Tags (Press Enter)</label>
            <input 
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md"
              placeholder="Add tag..."
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map(tag => (
                <span key={tag} className="text-xs bg-muted border border-border px-1.5 py-0.5 rounded flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive text-[10px]">✕</button>
                </span>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={featured} 
              onChange={e => setFeatured(e.target.checked)}
              className="rounded border-border bg-background"
            />
            <span className="text-sm font-medium">Featured Article</span>
          </label>
        </div>
      </div>
      </div>
    </div>
  );
}
