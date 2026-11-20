'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { storageCategories } from '@apptit/contracts';
import type { SiteAccess, StorageLocation } from '@apptit/contracts';
import { useNotifications } from '@apptit/ui/components/notifications';
import { Button, buttonVariants } from '@apptit/ui/components/button';
import { Input } from '@apptit/ui/components/input';
import { Label } from '@apptit/ui/components/label';
import { Card, CardContent } from '@apptit/ui/components/card';
import { Badge } from '@apptit/ui/components/badge';
import { Alert } from '@apptit/ui/components/alert';
import { Skeleton } from '@apptit/ui/components/skeleton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@apptit/ui/components/alert-dialog';
import { Plus, Pencil, Trash2, RotateCw } from '@apptit/ui/icons';
import { csrfForRequest, invalidateDeniedAccess, onlineSignal } from '../../lib/online-request';
import { fr } from '../../i18n/fr';

type LocationForm = {
  id: string;
  expectedVersion: number;
  name: string;
  category: string;
  isActive: boolean;
};
const emptyForm: LocationForm = {
  id: '',
  expectedVersion: 0,
  name: '',
  category: '',
  isActive: true,
};

export default function StorageLocations({ site }: { site: SiteAccess }) {
  const notifications = useNotifications();
  const [pendingRemove, setPendingRemove] = useState<StorageLocation | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const alive = useRef(true);
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState<StorageLocation[]>([]);
  const [busy, setBusy] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationForm>({ defaultValues: emptyForm });
  const form = watch();

  async function request(action: 'list' | 'save' | 'remove', value: unknown, signal?: AbortSignal) {
    signal = onlineSignal(signal);
    const csrf = await csrfForRequest(signal);
    const response = await fetch(`/api/storage-locations/${action}`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
      body: JSON.stringify(value),
    });
    invalidateDeniedAccess(response);
    if (!response.ok) throw new Error('UNCONFIRMED');
    return response.json() as Promise<StorageLocation[] | StorageLocation>;
  }
  useEffect(() => {
    alive.current = true;
    const abort = new AbortController();
    setMessage(fr.storage.loading);
    void request('list', { scope: { tenantId: site.tenantId, siteId: site.siteId } }, abort.signal)
      .then((value) => {
        if (!abort.signal.aborted) {
          setRows(value as StorageLocation[]);
          setLoaded(true);
          setMessage('');
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) setMessage(fr.storage.failure);
      });
    return () => {
      alive.current = false;
      abort.abort();
    };
  }, [site.tenantId, site.siteId]);
  useEffect(() => {
    if (message === fr.storage.removed) statusRef.current?.focus();
  }, [message]);

  async function reload() {
    setBusy(true);
    try {
      const value = (await request('list', {
        scope: { tenantId: site.tenantId, siteId: site.siteId },
      })) as StorageLocation[];
      if (!alive.current) return;
      setRows(value);
      setLoaded(true);
      const found = value.find((row) => row.id === form.id);
      reset(
        found
          ? {
              id: found.id,
              name: found.name,
              category: found.category ?? '',
              isActive: found.isActive,
              expectedVersion: found.version,
            }
          : emptyForm,
      );
      setNeedsReload(false);
      setMessage('');
    } catch {
      if (alive.current) setMessage(fr.storage.failure);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  function fresh() {
    reset({ ...emptyForm, id: crypto.randomUUID() });
    setMessage('');
  }
  async function save(values: LocationForm) {
    if (busy || needsReload || !loaded || pendingRemove) return;
    setBusy(true);
    setMessage('');
    const id = values.id || crypto.randomUUID();
    setValue('id', id);
    try {
      const saved = (await request('save', {
        ...values,
        id,
        scope: { tenantId: site.tenantId, siteId: site.siteId },
      })) as StorageLocation;
      if (!alive.current) return;
      setRows((current) => [...current.filter((row) => row.id !== saved.id), saved]);
      reset(emptyForm);
      setMessage(fr.storage.saved);
      notifications.success(fr.ui.locationSaved);
    } catch {
      if (alive.current) {
        setNeedsReload(true);
        setMessage(fr.storage.failure);
      }
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function remove() {
    if (!pendingRemove || busy) return;
    setBusy(true);
    setMessage('');
    try {
      await request('remove', {
        scope: { tenantId: site.tenantId, siteId: site.siteId },
        id: pendingRemove.id,
        expectedVersion: pendingRemove.version,
      });
      if (!alive.current) return;
      setRows((current) => current.filter((row) => row.id !== pendingRemove.id));
      if (form.id === pendingRemove.id) reset(emptyForm);
      setPendingRemove(null);
      setMessage(fr.storage.removed);
      notifications.success(fr.ui.locationRemoved);
    } catch {
      if (alive.current) {
        setPendingRemove(null);
        setNeedsReload(true);
        setMessage(fr.storage.failure);
      }
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  if (!site.capabilities.includes('storage.location.manage')) return <p>{fr.storage.noAccess}</p>;
  const disabled = busy || needsReload || !loaded || !!pendingRemove;
  return (
    <section id="storage" className="storage-configuration" aria-busy={busy}>
      <header className="storage-heading">
        <div>
          <p className="eyebrow">{fr.storage.subtitle}</p>
          <h1>{fr.storage.title}</h1>
          <p>{fr.storage.intro}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={busy || !!pendingRemove}
          onClick={() => void reload()}
        >
          <RotateCw aria-hidden="true" />
          {fr.storage.reload}
        </Button>
      </header>
      {message && (
        <Alert
          ref={statusRef}
          tabIndex={-1}
          role="status"
          variant={needsReload ? 'destructive' : 'default'}
          className="my-4"
        >
          {message}
        </Alert>
      )}
      {!loaded && message === fr.storage.loading && (
        <div aria-hidden="true" className="grid gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {loaded && (
        <dl className="storage-stats">
          <div>
            <dt>{fr.storage.total}</dt>
            <dd>{rows.length}</dd>
          </div>
          <div>
            <dt>{fr.storage.activeCount}</dt>
            <dd>{rows.filter((row) => row.isActive).length}</dd>
          </div>
          <div>
            <dt>{fr.storage.categoryCount}</dt>
            <dd>
              {new Set(rows.flatMap((row) => (row.category ? [row.category] : []))).size}{' '}
              <span>/ 5</span>
            </dd>
          </div>
        </dl>
      )}
      <div className="storage-layout">
        <Card>
          <CardContent className="p-6">
            <form className="storage-editor" noValidate onSubmit={handleSubmit(save)}>
              <fieldset disabled={disabled}>
                <legend>{form.expectedVersion ? fr.storage.edit : fr.storage.new}</legend>
                <div className="grid gap-2">
                  <Label htmlFor="storage-name">{fr.storage.name}</Label>
                  <Input
                    id="storage-name"
                    required
                    maxLength={100}
                    aria-invalid={!!errors.name}
                    aria-describedby={`storage-name-hint${errors.name ? ' storage-name-error' : ''}`}
                    {...register('name', {
                      required: fr.storage.nameRequired,
                      validate: (value) => !!value.trim() || fr.storage.nameRequired,
                      maxLength: { value: 100, message: fr.storage.nameTooLong },
                    })}
                  />
                  <p id="storage-name-hint" className="storage-hint">
                    {fr.storage.nameHint}
                  </p>
                  {errors.name && (
                    <p id="storage-name-error" role="alert" className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storage-category">{fr.storage.category}</Label>
                  <select
                    required
                    id="storage-category"
                    aria-invalid={!!errors.category}
                    aria-describedby={`storage-category-hint${errors.category ? ' storage-category-error' : ''}`}
                    {...register('category', { required: fr.storage.categoryRequired })}
                  >
                    <option value="">{fr.storage.choose}</option>
                    {storageCategories.map((category) => (
                      <option value={category} key={category}>
                        {fr.categories[category].label}
                      </option>
                    ))}
                  </select>
                  <p id="storage-category-hint" className="storage-hint">
                    {fr.storage.categoryHint}
                  </p>
                  {errors.category && (
                    <p
                      id="storage-category-error"
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div className="storage-availability">
                  <label className="physical-match">
                    <input type="checkbox" {...register('isActive')} />
                    {fr.storage.active}
                  </label>
                  <p className="storage-hint">{fr.storage.activeHelp}</p>
                </div>
                <div className="storage-form-actions">
                  <Button type="submit" disabled={disabled}>
                    <Plus aria-hidden="true" />
                    {busy ? fr.storage.saving : fr.storage.save}
                  </Button>
                  <Button type="button" variant="outline" onClick={fresh}>
                    {fr.storage.cancel}
                  </Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
        <div className="storage-inventory">
          <h2>{fr.storage.listTitle}</h2>
          <p className="storage-hint">{fr.storage.listHelp}</p>
          {loaded && rows.length === 0 && (
            <Card className="p-6 text-muted-foreground">{fr.storage.empty}</Card>
          )}
          {[...storageCategories, null].map((category) => {
            const locations = rows
              .filter((row) => row.category === category)
              .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
            if (!locations.length) return null;
            return (
              <section className="storage-group" key={category ?? 'legacy'}>
                <h3>
                  {category ? fr.categories[category].label : fr.storage.unclassified}
                  <span>{locations.length}</span>
                </h3>
                <ul>
                  {locations.map((row) => (
                    <li className="storage-location-card" key={row.id}>
                      <div className="storage-location-name">
                        <strong>{row.name}</strong>
                        <Badge variant={row.isActive ? 'secondary' : 'outline'}>
                          {row.isActive ? fr.storage.active : fr.storage.inactive}
                        </Badge>
                      </div>
                      <div className="storage-row-actions">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy || needsReload || !!pendingRemove}
                          onClick={() =>
                            reset({
                              id: row.id,
                              expectedVersion: row.version,
                              name: row.name,
                              category: row.category ?? '',
                              isActive: row.isActive,
                            })
                          }
                        >
                          <Pencil aria-hidden="true" />
                          {fr.storage.edit}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={busy || needsReload || !!pendingRemove}
                          aria-label={`${fr.storage.remove} ${row.name}`}
                          onClick={(event) => {
                            triggerRef.current = event.currentTarget;
                            setPendingRemove(row);
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                          {fr.storage.remove}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
      <AlertDialog
        open={!!pendingRemove}
        onOpenChange={(open) => {
          if (!open && !busy) setPendingRemove(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (triggerRef.current?.isConnected) triggerRef.current.focus();
            else statusRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{fr.storage.removeTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemove?.name} — {fr.storage.removeHelp}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{fr.storage.keep}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
            >
              {fr.storage.confirmRemove}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
