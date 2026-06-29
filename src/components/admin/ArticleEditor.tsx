import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import CharacterCount from '@tiptap/extension-character-count';
import { common, createLowlight } from 'lowlight';
import { slugify } from '../../lib/utils';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import 'highlight.js/styles/atom-one-dark.css';

const lowlight = createLowlight(common);

export default function ArticleEditor({ article, mode }: { article?: any; mode: 'new' | 'edit' }) {
  const [title, setTitle] = useState(article?.title || '');
  const [description, setDescription] = useState(article?.description || '');
  const [category, setCategory] = useState(article?.category || 'General');
  const [status, setStatus] = useState(article?.status || 'draft');
  const [featured, setFeatured] = useState(article?.featured || false);
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!article?.slug);
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<{tag: string, count: number}[]>([]);
  const [showTagAutocomplete, setShowTagAutocomplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftBanner, setDraftBanner] = useState<{ timestamp: number; payload: any } | null>(null);

  const [linkModal, setLinkModal] = useState({ isOpen: false, url: '', newTab: true });
  const [altModal, setAltModal] = useState<{ isOpen: boolean; url: string; alt: string }>({ isOpen: false, url: '', alt: '' });
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialDataRef = useRef({
    title: article?.title || '',
    slug: article?.slug || '',
    description: article?.description || '',
    category: article?.category || 'General',
    status: article?.status || 'draft',
    featured: article?.featured || false,
    coverImageUrl: article?.coverImageUrl || '',
    tags: article?.tags || [],
    contentJson: article?.contentJson || ''
  });

  // Fetch available tags for autocomplete
  useEffect(() => {
    fetch('/api/public/tags')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableTags(data);
      })
      .catch(() => {});
  }, []);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('Uploading image...');
    try {
      const res = await fetch('/api/articles/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }
      const data = await res.json();
      toast.success('Image uploaded', { id: toastId });
      setPendingImages(prev => [...prev, data.url]);
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(uploadImage);
    }
  };

  useEffect(() => {
    if (pendingImages.length > 0 && !altModal.isOpen) {
      setAltModal({ isOpen: true, url: pendingImages[0], alt: '' });
    }
  }, [pendingImages, altModal.isOpen]);

  const submitAltText = () => {
    if (editor) {
      editor.chain().focus().setImage({ src: altModal.url, alt: altModal.alt }).run();
    }
    setPendingImages(prev => prev.slice(1));
    setAltModal({ isOpen: false, url: '', alt: '' });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' }
      }),
      Image,
      Placeholder.configure({ placeholder: 'Write your story here...' }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      CharacterCount.configure({
        limit: null,
      }),
    ],
    content: article?.contentJson ? JSON.parse(article.contentJson) : '',
    editorProps: {
      attributes: {
        class: 'prose prose-blue focus:outline-none min-h-[500px] w-full article-content text-foreground',
      },
      handlePaste(view, event, slice) {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.indexOf('image') === 0) {
              const file = item.getAsFile();
              if (file) {
                uploadImage(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = event.dataTransfer.files;
          for (let i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') === 0) {
              uploadImage(files[i]);
            }
          }
          return true;
        }
        return false;
      }
    },
  });

  const isDirty = () => {
    const d = initialDataRef.current;
    if (d.title !== title) return true;
    if (d.slug !== slug) return true;
    if (d.description !== description) return true;
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
  }, [title, slug, description, category, status, featured, coverImageUrl, tags, editor?.state]);

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
          coverImageUrl, category, status, featured, tags, slugManuallyEdited
        };
        localStorage.setItem(draftKey, JSON.stringify({ timestamp: Date.now(), payload }));
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [title, slug, description, category, status, featured, coverImageUrl, tags, slugManuallyEdited, editor?.state, draftKey]);

  const handleTitleBlur = () => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title || !editor) {
      toast.error('Title and content are required');
      return;
    }
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
      category,
      status: finalStatus,
      featured,
      tags,
    };

    try {
      const url = mode === 'edit' && article?.id ? `/api/articles/${article.id}` : '/api/articles';
      const method = mode === 'edit' && article?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem(draftKey);
        initialDataRef.current = {
          title, slug, description, category, status: finalStatus, featured, coverImageUrl, tags,
          contentJson: JSON.stringify(payload.contentJson)
        };
        
        const data = await res.json();
        
        if (publish) {
          toast.success('Article published successfully!');
        } else {
          toast.success('Draft saved successfully!');
        }

        if (mode === 'new' && data.id) {
          window.history.replaceState({}, '', `/admin/articles/${data.id}/edit`);
          window.location.href = `/admin/articles/${data.id}/edit`;
        }
      } else {
        const data = await res.json();
        toast.error('Failed to save article: ' + (data.details?.[0]?.message || data.error));
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving article');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (newTagRaw: string) => {
    const newTag = newTagRaw.toLowerCase();
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
    setShowTagAutocomplete(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const previousTarget = editor?.getAttributes('link').target;
    setLinkModal({ isOpen: true, url: previousUrl || '', newTab: previousTarget === '_blank' });
  };

  const submitLink = () => {
    if (!editor) return;
    if (linkModal.url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ 
        href: linkModal.url,
        target: linkModal.newTab ? '_blank' : ''
      }).run();
    }
    setLinkModal({ isOpen: false, url: '', newTab: true });
  };

  const words = editor?.storage.characterCount.words() || 0;
  const readingTime = Math.ceil(words / 200);
  
  const filteredTags = availableTags.filter(t => t.tag.includes(tagInput.toLowerCase()) && !tags.includes(t.tag));

  return (
    <div className="flex flex-col gap-8 pb-20">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, image/gif" multiple onChange={handleFileChange} />

      <Modal isOpen={linkModal.isOpen} onClose={() => setLinkModal({ ...linkModal, isOpen: false })} title="Insert Link">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input type="url" value={linkModal.url} onChange={e => setLinkModal({ ...linkModal, url: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground" placeholder="https://..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={linkModal.newTab} onChange={e => setLinkModal({ ...linkModal, newTab: e.target.checked })} className="rounded border-border bg-background" />
            <span className="text-sm">Open in new tab</span>
          </label>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setLinkModal({ ...linkModal, isOpen: false })} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={submitLink} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium">Save</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={altModal.isOpen} onClose={() => {
        setPendingImages(prev => prev.slice(1));
        setAltModal({ isOpen: false, url: '', alt: '' });
      }} title="Image Alt Text">
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {altModal.url && <img src={altModal.url} alt="Preview" className="max-w-full max-h-full object-contain" />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text (Required for accessibility)</label>
            <input type="text" value={altModal.alt} onChange={e => setAltModal({ ...altModal, alt: e.target.value })} onKeyDown={e => e.key === 'Enter' && submitAltText()} className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground" placeholder="Describe the image..." autoFocus />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => {
              setPendingImages(prev => prev.slice(1));
              setAltModal({ isOpen: false, url: '', alt: '' });
            }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Skip</button>
            <button onClick={submitAltText} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium">Insert Image</button>
          </div>
        </div>
      </Modal>

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
        <div className="sticky top-[64px] z-10 flex flex-wrap gap-1 p-2 bg-background/80 backdrop-blur border-b border-border mb-6 rounded-t-lg items-center">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bold') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><b>B</b></button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('italic') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><i>I</i></button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('strike') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><s>S</s></button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-sm rounded font-bold ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>H2</button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1 text-sm rounded font-bold ${editor?.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>H3</button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>• List</button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>1. List</button>
          <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('blockquote') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>"Quote"</button>
          <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('codeBlock') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>&lt;/&gt;</button>
          
          {editor?.isActive('codeBlock') && (
            <select 
              className="ml-2 bg-background border border-border text-foreground rounded text-sm px-2 py-1 outline-none"
              onChange={(e) => editor.chain().focus().setCodeBlock({ language: e.target.value }).run()}
              value={editor.getAttributes('codeBlock').language || ''}
            >
              <option value="">Auto / Plain</option>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="yaml">YAML</option>
            </select>
          )}

          <div className="w-px h-6 bg-border mx-1"></div>
          <button onClick={setLink} className={`px-2 py-1 text-sm rounded ${editor?.isActive('link') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>🔗</button>
          <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 text-sm rounded hover:bg-muted">🖼</button>
          <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="px-2 py-1 text-sm rounded hover:bg-muted">—</button>
        </div>

        {/* Bubble Menu */}
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden rounded-lg border border-border bg-card shadow-xl p-1 gap-1">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><b>B</b></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}><i>I</i></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-sm rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>H2</button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-2 py-1 text-sm rounded ${editor.isActive('blockquote') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>"Quote"</button>
            <button onClick={setLink} className={`px-2 py-1 text-sm rounded ${editor.isActive('link') ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>🔗</button>
          </BubbleMenu>
        )}

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

          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border">
            <span>{words} words</span>
            <span>{readingTime} min read</span>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md text-foreground outline-none">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="disabled">Disabled</option>
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
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md text-foreground outline-none focus:border-primary"
            />
            {slug && <p className="text-xs text-muted-foreground mt-1">Preview: /blog/{slug}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Description (SEO)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md h-20 resize-none text-foreground outline-none focus:border-primary"
              placeholder="Brief summary..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Category</label>
            <input 
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Cover Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={coverImageUrl}
                onChange={e => setCoverImageUrl(e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md text-foreground outline-none focus:border-primary"
                placeholder="/uploads/articles/..."
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-medium mb-1 text-muted-foreground">Tags (Press Enter)</label>
            <input 
              type="text"
              value={tagInput}
              onChange={e => {
                setTagInput(e.target.value);
                setShowTagAutocomplete(true);
              }}
              onFocus={() => setShowTagAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowTagAutocomplete(false), 200)}
              onKeyDown={handleAddTag}
              className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-md text-foreground outline-none focus:border-primary"
              placeholder="Add tag..."
            />
            {showTagAutocomplete && tagInput && filteredTags.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                {filteredTags.map(t => (
                  <button
                    key={t.tag}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted text-foreground flex justify-between items-center"
                    onMouseDown={() => addTag(t.tag)}
                  >
                    <span>{t.tag}</span>
                    <span className="text-xs text-muted-foreground">{t.count}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map(tag => (
                <span key={tag} className="text-xs bg-muted border border-border px-1.5 py-0.5 rounded flex items-center gap-1 text-foreground">
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
