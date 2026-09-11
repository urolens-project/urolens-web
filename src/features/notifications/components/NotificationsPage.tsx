import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  FlaskConical,
  Loader2,
  ScanSearch,
  Stethoscope,
} from 'lucide-react';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { formatNotificationTime, getNotificationLink } from '../utils';
import type { NotificationItem } from '../types';

type Filter = 'all' | 'unread';

// One icon + accent color per notification_type, so the list can be scanned
// at a glance instead of reading every line of text to tell what kind of
// thing happened.
const TYPE_STYLE: Record<string, { icon: typeof Bell; className: string }> = {
  RESULT_READY_FOR_REVIEW: { icon: FlaskConical, className: 'bg-amber-100 text-amber-700' },
  SMART_DIAGNOSIS_UNAVAILABLE: { icon: ScanSearch, className: 'bg-rose-100 text-rose-700' },
  RESULT_RELEASED: { icon: ClipboardList, className: 'bg-emerald-100 text-emerald-700' },
  SAMPLE_ASSIGNED: { icon: FlaskConical, className: 'bg-sky-100 text-sky-700' },
  LAB_REQUEST_SUBMITTED: { icon: Stethoscope, className: 'bg-violet-100 text-violet-700' },
};
const DEFAULT_TYPE_STYLE = { icon: Bell, className: 'bg-slate-100 text-slate-500' };

function dateGroupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-PH', { weekday: 'long' });
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(items: NotificationItem[]): [string, NotificationItem[]][] {
  const groups = new Map<string, NotificationItem[]>();
  for (const item of items) {
    const label = dateGroupLabel(item.created_at);
    const bucket = groups.get(label);
    if (bucket) bucket.push(item);
    else groups.set(label, [item]);
  }
  return [...groups.entries()];
}

export function NotificationsPage() {
  const { role } = useAuthContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;
  const visible = useMemo(
    () => (notifications ?? []).filter((n) => filter === 'all' || !n.is_read),
    [notifications, filter],
  );
  const grouped = useMemo(() => groupByDate(visible), [visible]);

  function handleItemClick(item: NotificationItem) {
    if (!item.is_read) markRead.mutate(item.notification_id);
    const link = getNotificationLink(item.notification_type, item.entity_id, role);
    if (link) navigate(link);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your {notifications && notifications.length >= 50 ? '50 most recent' : ''}{' '}
            notifications, newest first.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 mb-5">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`h-8 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === f ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="mx-auto h-8 w-8 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">
              {filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          grouped.map(([label, items]) => (
            <div key={label}>
              <p className="px-5 pt-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                {label}
              </p>
              <ul>
                {items.map((item) => {
                  const { icon: Icon, className } =
                    TYPE_STYLE[item.notification_type] ?? DEFAULT_TYPE_STYLE;
                  return (
                    <li key={item.notification_id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-start gap-3 text-left px-5 py-3.5 border-b border-slate-50 last:border-0 transition-colors cursor-pointer hover:bg-slate-50 ${
                          item.is_read ? '' : 'bg-emerald-50/40'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${className}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm leading-snug ${
                              item.is_read ? 'text-slate-500' : 'text-slate-800 font-medium'
                            }`}
                          >
                            {item.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatNotificationTime(item.created_at)}
                          </p>
                        </div>
                        {!item.is_read && (
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
