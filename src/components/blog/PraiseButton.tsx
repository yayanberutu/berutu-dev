import React, { useState, useEffect } from 'react';

interface PraiseButtonProps {
  slug: string;
  initialCount: number;
}

export default function PraiseButton({ slug, initialCount }: PraiseButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasPraised, setHasPraised] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/public/articles/${slug}/praise`);
        if (res.ok) {
          const data = await res.json();
          setCount(data.praiseCount);
          setHasPraised(data.hasPraised);
        }
      } catch (err) {
        console.error('Failed to fetch praise status', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [slug]);

  const handlePraise = async () => {
    if (hasPraised || loading) return;
    
    // Optimistic UI
    setCount(prev => prev + 1);
    setHasPraised(true);
    setAnimating(true);
    
    setTimeout(() => setAnimating(false), 1000);

    try {
      const res = await fetch(`/api/public/articles/${slug}/praise`, {
        method: 'POST',
      });
      if (!res.ok) {
        // Revert on failure
        setCount(prev => prev - 1);
        setHasPraised(false);
      } else {
        const data = await res.json();
        setCount(data.praiseCount);
      }
    } catch (err) {
      console.error('Failed to add praise', err);
      setCount(prev => prev - 1);
      setHasPraised(false);
    }
  };

  if (loading) {
    return <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handlePraise}
        disabled={hasPraised}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300
          ${hasPraised 
            ? 'bg-primary/10 border-primary text-primary cursor-default' 
            : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer shadow-sm hover:shadow-md'
          }
          ${animating ? 'scale-110 shadow-primary/20 shadow-lg' : 'scale-100'}
        `}
        aria-label="Praise this article"
      >
        <span className={`text-2xl transition-transform ${animating ? 'animate-bounce' : ''}`}>👏</span>
        
        {/* Ripple effect container */}
        {animating && (
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75"></span>
        )}
      </button>
      <span className={`text-sm font-medium ${hasPraised ? 'text-primary' : 'text-muted-foreground'}`}>
        {count} {count === 1 ? 'Praise' : 'Praises'}
      </span>
    </div>
  );
}
