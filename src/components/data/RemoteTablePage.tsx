import { useEffect, useState, type ReactNode } from 'react';

import { EmptyState, ErrorState, LoadingState } from '@/components/page-states/PageState';
import type { ApiMeta, ApiSuccess } from '@/types/api';

export interface RemoteTableColumn<T> {
  header: string;
  render(item: T): ReactNode;
}

interface RemoteTablePageProps<T> {
  title: string;
  description?: string;
  load(): Promise<ApiSuccess<T[]>>;
  columns: RemoteTableColumn<T>[];
  getRowKey(item: T, index: number): string | number;
  emptyDescription?: string;
}

export function RemoteTablePage<T>({
  title,
  description,
  load,
  columns,
  getRowKey,
  emptyDescription,
}: RemoteTablePageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setError(false);

      try {
        const response = await load();
        if (!cancelled) {
          setItems(response.data);
          setMeta(response.meta ?? null);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setMeta(null);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [load]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <section className="resource-page">
      <header className="resource-header">
        <div>
          <p className="overview-eyebrow">Dữ liệu thực</p>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {typeof meta?.total === 'number' ? (
          <span className="resource-count">{new Intl.NumberFormat('vi-VN').format(meta.total)} bản ghi</span>
        ) : null}
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overview-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.header}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={getRowKey(item, index)}>
                  {columns.map((column) => (
                    <td key={column.header}>{column.render(item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {emptyDescription && items.length === 0 ? <p className="resource-note">{emptyDescription}</p> : null}
    </section>
  );
}
