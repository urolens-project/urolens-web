import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { formatNotificationTime, getNotificationLink } from '../utils';
import type { NotificationItem } from '../types';

export function NotificationBell() {
  const { role } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleItemClick(item: NotificationItem) {
    if (!item.is_read) markRead.mutate(item.notification_id);
    const link = getNotificationLink(item.notification_type, item.entity_id, role);
    setOpen(false);
    if (link) navigate(link);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 max-h-[28rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No notifications yet.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((item) => (
                  <li key={item.notification_id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 transition-colors cursor-pointer hover:bg-slate-50 ${
                        item.is_read ? '' : 'bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!item.is_read && (
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <div className={`min-w-0 ${item.is_read ? 'pl-3.5' : ''}`}>
                          <p
                            className={`text-xs leading-snug ${item.is_read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}
                          >
                            {item.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatNotificationTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
            className="shrink-0 px-4 py-2.5 border-t border-slate-100 text-center text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
