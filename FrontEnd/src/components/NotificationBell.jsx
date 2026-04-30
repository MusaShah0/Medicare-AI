import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}

export default function NotificationBell({ role }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [open, setOpen]                   = useState(false);
  const wrapperRef                        = useRef(null);

  const fetchNotifications = () => {
    axios.get(`${API}/notifications`, { withCredentials: true })
      .then(r => {
        if (r.data.success) {
          setNotifications(r.data.data || []);
          setUnread(r.data.unread || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${API}/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${API}/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const badgeCount = unread > 9 ? '9+' : unread;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.7)',
          transition: 'color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        aria-label="Notifications"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#EF4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            borderRadius: '9999px',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: '1',
            border: '1.5px solid #0A2540',
          }}>
            {badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(10,37,64,0.18)',
          zIndex: 9999,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 12px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0A2540' }}>
              Notifications
              {unread > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: 'rgba(0,180,160,0.12)',
                  color: '#00B4A0',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '9999px',
                  padding: '1px 7px',
                }}>
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#00B4A0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,160,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#94A3B8',
                fontSize: '13px',
              }}>
                <svg width="32" height="32" fill="none" stroke="#CBD5E1" strokeWidth="1.5" viewBox="0 0 24 24"
                  style={{ margin: '0 auto 10px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.read && handleMarkRead(n._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #F8FAFC',
                    cursor: n.read ? 'default' : 'pointer',
                    borderLeft: n.read ? '4px solid transparent' : '4px solid #00B4A0',
                    background: n.read ? '#fff' : 'rgba(0,180,160,0.04)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = 'rgba(0,180,160,0.08)'; }}
                  onMouseLeave={e => { if (!n.read) e.currentTarget.style.background = 'rgba(0,180,160,0.04)'; }}
                >
                  {/* Dot indicator */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: n.read ? '#CBD5E1' : '#00B4A0',
                    flexShrink: 0,
                    marginTop: '5px',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: n.read ? '500' : '700',
                      fontSize: '13px',
                      color: '#0A2540',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#64748B',
                      lineHeight: '1.4',
                      marginBottom: '4px',
                    }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
