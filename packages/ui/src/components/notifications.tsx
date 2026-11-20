'use client';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Toaster, toast } from 'sonner';

type Notifications = { success: (message: string, key?: string) => void };
const NotificationContext = createContext<Notifications | null>(null);

/** Mount inside the authenticated actor/site boundary. No global unscoped toast API. */
export function NotificationProvider({ children, label }: { children: ReactNode; label: string }) {
  const toasterId = useId();
  const active = useRef(false);
  const owned = useRef(new Set<string | number>());
  useEffect(() => {
    active.current = true;
    const ids = owned.current;
    return () => {
      active.current = false;
      for (const id of ids) toast.dismiss(id);
      ids.clear();
    };
  }, []);
  const success = useCallback(
    (message: string, key?: string) => {
      if (!active.current) return;
      const id = toast.success(message, {
        toasterId,
        ...(key ? { id: `${toasterId}:${key}` } : {}),
        onDismiss: (value) => {
          owned.current.delete(value.id);
        },
        onAutoClose: (value) => {
          owned.current.delete(value.id);
        },
      });
      owned.current.add(id);
    },
    [toasterId],
  );
  const value = useMemo(() => ({ success }), [success]);
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="apptit-notification-host">
        <Toaster
          id={toasterId}
          theme="light"
          position="bottom-right"
          visibleToasts={3}
          duration={4500}
          containerAriaLabel={label}
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
            },
          }}
        />
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): Notifications {
  const value = useContext(NotificationContext);
  if (!value) throw new Error('Notifications require NotificationProvider.');
  return value;
}
