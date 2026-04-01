'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface Suggestion {
  id: number;
  brand: string;
  model_name: string;
  displacement_cc: number | null;
  msrp: number | null;
  image_url: string | null;
}

const HOT_KEYWORDS = [
  'Ninja 400', 'YZF-R3', 'CBR650R', 'MT-07', 'Z900',
  'GOGORO', 'DRG', 'XMAX', 'Rebel 500', 'Duke 390',
];

const c = {
  bg: '#1d2021', card: '#282828', border: '#3c3836',
  text: '#ebdbb2', muted: '#928374', green: '#b8f53e',
  gold: '#fabd2f', red: '#fb4934',
};

interface SearchBarProps {
  /** Show hot keywords below the bar */
  showHot?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Initial search value */
  initialValue?: string;
  /** Called when user submits search (pressing Enter) */
  onSearch?: (query: string) => void;
  /** Compact mode for header embedding */
  compact?: boolean;
}

export default function SearchBar({
  showHot = false,
  placeholder = '搜尋車款、品牌、型號...',
  autoFocus = false,
  initialValue = '',
  onSearch,
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced autocomplete search
  const searchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('vehicle_specs')
        .select('id, brand, model_name, displacement_cc, msrp, image_url')
        .or(`model_name.ilike.%${q}%,brand.ilike.%${q}%`)
        .order('brand', { ascending: true })
        .limit(8);
      setSuggestions((data || []) as Suggestion[]);
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchSuggestions]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setShowSuggestions(false);
    router.push(`/bikes/${encodeURIComponent(s.brand)}/${encodeURIComponent(s.model_name)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIdx >= 0 && selectedIdx < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIdx]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleHotClick = (kw: string) => {
    setQuery(kw);
    router.push(`/search?q=${encodeURIComponent(kw)}`);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center',
        backgroundColor: c.card,
        border: `1px solid ${showSuggestions && suggestions.length > 0 ? c.green : c.border}`,
        borderRadius: compact ? '3px' : '4px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}>
        <span style={{
          padding: compact ? '8px 10px' : '12px 14px',
          color: c.green, fontSize: compact ? '13px' : '15px',
          flexShrink: 0,
        }}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); setSelectedIdx(-1); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            flex: 1, border: 'none', outline: 'none',
            backgroundColor: 'transparent',
            color: c.text,
            fontSize: compact ? '12px' : '14px',
            fontFamily: "'JetBrains Mono', monospace",
            padding: compact ? '8px 0' : '12px 0',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }} style={{
            background: 'transparent', border: 'none', color: c.muted,
            cursor: 'pointer', padding: '8px', fontSize: '14px',
          }}>✕</button>
        )}
        <button onClick={handleSubmit} style={{
          backgroundColor: c.green, color: c.bg, border: 'none',
          padding: compact ? '8px 14px' : '12px 20px',
          fontWeight: 'bold', fontSize: compact ? '11px' : '12px',
          cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '1px',
        }}>
          SEARCH
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: c.card,
          border: `1px solid ${c.border}`,
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          zIndex: 100,
          maxHeight: '360px',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {loading && (
            <div style={{ padding: '12px 16px', color: c.muted, fontSize: '12px' }}>搜尋中...</div>
          )}
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              onClick={() => handleSuggestionClick(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 16px',
                cursor: 'pointer',
                backgroundColor: selectedIdx === i ? 'rgba(184, 245, 62, 0.08)' : 'transparent',
                borderBottom: `1px solid ${c.border}`,
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              {/* Thumbnail */}
              <div style={{
                width: '44px', height: '32px', borderRadius: '3px',
                backgroundColor: c.bg, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {s.image_url ? (
                  <img src={s.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: '14px' }}>🏍</span>
                )}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: c.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.brand} {s.model_name}
                </div>
                <div style={{ fontSize: '10px', color: c.muted }}>
                  {s.displacement_cc ? `${s.displacement_cc}cc` : ''}
                  {s.msrp ? ` · NT$${s.msrp.toLocaleString()}` : ''}
                </div>
              </div>
              <span style={{ fontSize: '10px', color: c.muted }}>→</span>
            </div>
          ))}
          {!loading && suggestions.length > 0 && (
            <div
              onClick={handleSubmit}
              style={{
                padding: '10px 16px', textAlign: 'center',
                color: c.green, fontSize: '12px', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              查看所有「{query}」的搜尋結果 →
            </div>
          )}
        </div>
      )}

      {/* Hot keywords */}
      {showHot && !showSuggestions && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: c.muted, marginRight: '4px' }}>🔥 熱門：</span>
          {HOT_KEYWORDS.map(kw => (
            <button key={kw} onClick={() => handleHotClick(kw)} style={{
              backgroundColor: 'transparent',
              border: `1px solid ${c.border}`,
              color: c.muted, padding: '3px 10px',
              borderRadius: '12px', fontSize: '11px',
              cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.green; e.currentTarget.style.color = c.green; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted; }}
            >
              {kw}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
