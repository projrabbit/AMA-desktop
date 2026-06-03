import { useEffect, useState } from 'react';

import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDateTime } from '@/lib/format';
import { auditActionLabels, getAuditActionLabel } from '@/lib/i18n/labels';
import { auditLogService } from '@/services/auditLogService';
import type { AuditLogItem, AuditLogListData } from '@/types/api';

const ALL = '';
const PAGE_SIZE = 20;

export function AuditLogsPage() {
  const [data, setData] = useState<AuditLogListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [actor, setActor] = useState('');
  const [actionType, setActionType] = useState(ALL);
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [offset, setOffset] = useState(0);

  const [selected, setSelected] = useState<AuditLogItem | null>(null);

  async function load(nextOffset = offset) {
    setLoading(true);
    const query = {
      account_id: actor ? Number(actor) : undefined,
      action_type: actionType || undefined,
      target_entity: entity || undefined,
      from: from || undefined,
      to: to || undefined,
      limit: PAGE_SIZE,
      offset: nextOffset,
    };
    try {
      setLoadError(false);
      const { data: result } = await auditLogService.list(query);
      setData(result);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    setOffset(0);
    void load(0);
  }

  function changePage(delta: number) {
    const next = Math.max(0, offset + delta * PAGE_SIZE);
    setOffset(next);
    void load(next);
  }

  if (loading && !data) {
    return <LoadingState />;
  }

  if (loadError && !data) {
    return <ErrorState />;
  }

  const items = data?.items ?? [];
  const total = data?.total ?? items.length;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);

  return (
    <section className="screen-stack">
      <header className="screen-header">
        <div>
          <h2>Tra cứu nhật ký hệ thống</h2>
          <p>Lịch sử thao tác để kiểm tra và truy vết. Màn hình chỉ đọc, không có chỉnh sửa hoặc xóa.</p>
        </div>
      </header>

      <div className="filter-bar">
        <Input label="Mã tài khoản" placeholder="vd 1001" value={actor} onChange={(e) => setActor(e.target.value)} />
        <Select
          label="Loại thao tác"
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          options={[
            { value: ALL, label: 'Tất cả' },
            ...Object.entries(auditActionLabels).map(([value, label]) => ({ value, label })),
          ]}
        />
        <Input label="Khu vực dữ liệu" placeholder="vd device" value={entity} onChange={(e) => setEntity(e.target.value)} />
        <DatePicker label="Từ ngày" value={from} onChange={(e) => setFrom(e.target.value)} />
        <DatePicker label="Đến ngày" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="filter-bar__actions">
          <Button onClick={handleSearch}>Tìm kiếm</Button>
        </div>
      </div>

      <div className="two-pane">
        <div className="table-wrap">
          <table className="ui-table">
            <caption>Nhật ký thao tác</caption>
            <thead>
              <tr>
                <th scope="col">Thời gian</th>
                <th scope="col">Tài khoản</th>
                <th scope="col">Hành động</th>
                <th scope="col">Đối tượng</th>
                <th scope="col">Mã đối tượng</th>
                <th scope="col">IP</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((log) => (
                  <tr
                    key={log.log_id}
                    className={`row-selectable ${log.log_id === selected?.log_id ? 'row-selected' : ''}`.trim()}
                    onClick={() => setSelected(log)}
                  >
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>#{log.account_id}</td>
                    <td>{getAuditActionLabel(log.action_type)}</td>
                    <td>{log.target_entity}</td>
                    <td>{log.target_id ?? '—'}</td>
                    <td>{log.ip_address ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Không có nhật ký phù hợp với điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination">
            <span>
              {pageStart}–{pageEnd} / {total}
            </span>
            <Button variant="ghost" onClick={() => changePage(-1)} disabled={offset === 0}>
              Trước
            </Button>
            <Button variant="ghost" onClick={() => changePage(1)} disabled={pageEnd >= total}>
              Sau
            </Button>
          </div>
        </div>

        <aside className="detail-panel" aria-label="Chi tiết nhật ký">
          {selected ? (
            <>
              <h3>Nhật ký #{selected.log_id}</h3>
              <dl className="detail-list">
                <div>
                  <dt>Thời gian</dt>
                  <dd>{formatDateTime(selected.created_at)}</dd>
                </div>
                <div>
                  <dt>Tài khoản</dt>
                  <dd>#{selected.account_id}</dd>
                </div>
                <div>
                  <dt>Hành động</dt>
                  <dd>{getAuditActionLabel(selected.action_type)}</dd>
                </div>
                <div>
                  <dt>Đối tượng</dt>
                  <dd>
                    {selected.target_entity} {selected.target_id ? `#${selected.target_id}` : ''}
                  </dd>
                </div>
              </dl>
              <div>
                <p className="overview-panel__label" style={{ marginBottom: 6 }}>
                  Nội dung thay đổi
                </p>
                <pre
                  style={{
                    background: '#0f172a',
                    borderRadius: 12,
                    color: '#e2e8f0',
                    fontSize: '0.8rem',
                    margin: 0,
                    overflowX: 'auto',
                    padding: 12,
                  }}
                >
                  {JSON.stringify(selected.payload ?? {}, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p>Chọn một dòng nhật ký để xem chi tiết (chỉ đọc).</p>
          )}
        </aside>
      </div>
    </section>
  );
}
