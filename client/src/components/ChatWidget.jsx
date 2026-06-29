import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send } from 'lucide-react';

const API = 'http://localhost:5000';

const WELCOME = 'Hi! Ask me anything about donors, inventory, blood requests, or upcoming camps.';

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: WELCOME }]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Scroll to latest message whenever list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus text input when panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/api/chat`, { message: text });
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', text: msg, isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const canSend = !!input.trim() && !loading;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        title={open ? 'Close assistant' : 'Open assistant'}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#8B0000', border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139,0,0,0.35)',
          cursor: 'pointer', zIndex: 1000,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,0,0,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,0,0,0.35)'; }}
      >
        {open ? <X size={22} strokeWidth={2.2} /> : <MessageSquare size={22} strokeWidth={2} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px',
          width: '360px', height: '480px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
          border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '13px 18px',
            background: '#8B0000', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '10px',
            flexShrink: 0,
          }}>
            <MessageSquare size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2 }}>Blood Bank Assistant</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '2px' }}>Ask anything about your blood bank </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '2px', display: 'flex' }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Message history */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '14px 14px 6px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '86%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                  background: m.role === 'user'
                    ? '#8B0000'
                    : m.isError ? '#fef2f2' : '#f3f4f6',
                  color: m.role === 'user'
                    ? '#fff'
                    : m.isError ? '#991b1b' : '#111827',
                  fontSize: '0.84rem', lineHeight: 1.55,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator while waiting for response */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '11px 16px', borderRadius: '14px 14px 14px 4px',
                  background: '#f3f4f6',
                  display: 'flex', gap: '5px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#9ca3af', display: 'inline-block',
                      animation: `chatDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex', gap: '8px', alignItems: 'flex-end',
            flexShrink: 0, background: '#fff',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about inventory, donors, requests…"
              rows={1}
              style={{
                flex: 1, resize: 'none',
                border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '9px 12px',
                fontSize: '0.84rem', color: '#111827',
                outline: 'none', lineHeight: 1.45,
                maxHeight: '96px', overflowY: 'auto',
                fontFamily: 'inherit', background: '#f9fafb',
              }}
              onFocus={e => { e.target.style.borderColor = '#8B0000'; e.target.style.background = '#fff'; }}
              onBlur={e  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
            />
            <button
              onClick={send}
              disabled={!canSend}
              title="Send (Enter)"
              style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: canSend ? '#8B0000' : '#e5e7eb',
                border: 'none',
                color: canSend ? '#fff' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canSend ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
            >
              <Send size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}

      {/* Keyframes for the typing dots — injected once, scoped by class name */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40%            { transform: scale(1);    opacity: 1;    }
        }
      `}</style>
    </>
  );
}
