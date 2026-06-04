import { useEffect, useState, type FormEvent } from 'react';

import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { formatDateTime } from '@/lib/format';
import {
  activeFraudFlagLabels,
  getAttendanceStatusLabel,
  getAttendanceTypeLabel,
  getRejectionReasonLabel,
} from '@/lib/i18n/labels';
import { attendanceService } from '@/services/attendanceService';
import type { AttendanceExceptionItem, AttendanceRecordDetail } from '@/types/api';

const ALL = '';

function statusPillClass(status: string): string {
  if (status === 'approved') return 'status-pill status-pill--ok';
  if (status === 'rejected') return 'status-pill status-pill--danger';
  return 'status-pill status-pill--warn';
}

function maskFingerprint(value: string): string {
  if (value.length <= 6) return '••••';
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<AttendanceExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [status, setStatus] = useState(ALL);
  const [reason, setReason] = useState(ALL);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [selected, setSelected] = useState<AttendanceRecordDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = {
      status: status || undefined,
      reason: reason || undefined,
      from: from || undefined,
      to: to || undefined,
    };
    try {
      setLoadError(false);
      const { data } = await attendanceService.exceptions(params);
      setExceptions(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectRecord(recordId: number) {
    setSelectedId(recordId);
    setDetailLoading(true);
    try {
      const { data } = await attendanceService.detail(recordId);
      setSelected(data);
    } catch (error) {
      setNotice(getErrorMessage(error));
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleApprove(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setApproveError(null);
    setSubmitting(true);
    try {
      await attendanceService.approve(selected.record_id, approveNote || undefined);
      setNotice(`Đã phê duyệt thủ công lượt chấm công #${selected.record_id}.`);
      setApproveOpen(false);
      setApproveNote('');
      setSelected(null);
      setSelectedId(null);
      await load();
    } catch (error) {
      setApproveError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (loadError) {
    return <ErrorState />;
  }

  return (
    <section className="screen-stack">
      <header className="screen-header">
        <div>
          <h2>Quản lý ngoại lệ và cảnh báo gian lận</h2>
          <p>Xem, kiểm tra và xử lý các lượt chấm công bất thường. Mọi thao tác đều được ghi vào nhật ký hệ thống.</p>
        </div>
      </header>

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="filter-bar">
        <Select
          label="Trạng thái"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả trạng thái' },
            { value: 'pending', label: 'Chờ xử lý' },
            { value: 'flagged', label: 'Cần xem xét' },
            { value: 'rejected', label: 'Bị từ chối' },
            { value: 'approved', label: 'Hợp lệ' },
          ]}
        />
        <Select
          label="Lý do / cảnh báo"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả lý do' },
            { value: 'mock_location', label: 'Vị trí giả lập' },
            { value: 'outside_geofence', label: 'Ngoài vùng chấm công' },
            { value: 'untrusted_device', label: 'Thiết bị chưa tin cậy' },
            { value: 'face_mismatch', label: 'Khuôn mặt không khớp' },
            { value: 'liveness_failed', label: 'Không đạt liveness' },
          ]}
        />
        <DatePicker label="Từ ngày" value={from} onChange={(event) => setFrom(event.target.value)} />
        <DatePicker label="Đến ngày" value={to} onChange={(event) => setTo(event.target.value)} />
        <div className="filter-bar__actions">
          <Button onClick={load}>Lọc</Button>
        </div>
      </div>

      <div className="two-pane">
        <div className="table-wrap">
          <table className="ui-table">
            <caption>Danh sách ngoại lệ</caption>
            <thead>
              <tr>
                <th scope="col">Thời gian</th>
                <th scope="col">Nhân viên</th>
                <th scope="col">Loại</th>
                <th scope="col">Lý do</th>
                <th scope="col">Dấu hiệu</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.length > 0 ? (
                exceptions.map((item) => (
                  <tr
                    key={item.record_id}
                    className={`row-selectable ${item.record_id === selectedId ? 'row-selected' : ''}`.trim()}
                    onClick={() => selectRecord(item.record_id)}
                  >
                    <td>{formatDateTime(item.timestamp)}</td>
                    <td>{item.employee.full_name}</td>
                    <td>{getAttendanceTypeLabel(item.type)}</td>
                    <td>{item.rejection_reason ? getRejectionReasonLabel(item.rejection_reason) : '—'}</td>
                    <td>{activeFraudFlagLabels(item.fraud_flags).length} dấu hiệu</td>
                    <td>
                      <span className={statusPillClass(item.status)}>{getAttendanceStatusLabel(item.status)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Không có ngoại lệ trong khoảng thời gian được chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="detail-panel" aria-label="Chi tiết ngoại lệ">
          {detailLoading ? (
            <p>Đang tải chi tiết...</p>
          ) : selected ? (
            <>
              <h3>Lượt chấm công #{selected.record_id}</h3>
              <dl className="detail-list">
                <div>
                  <dt>Nhân viên</dt>
                  <dd>{selected.employee.full_name}</dd>
                </div>
                <div>
                  <dt>Phòng ban</dt>
                  <dd>{selected.employee.department_name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Loại</dt>
                  <dd>{getAttendanceTypeLabel(selected.type)}</dd>
                </div>
                <div>
                  <dt>Thời gian</dt>
                  <dd>{formatDateTime(selected.timestamp)}</dd>
                </div>
                <div>
                  <dt>Ca</dt>
                  <dd>{selected.shift?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Thiết bị</dt>
                  <dd>
                    {selected.device.platform} • {maskFingerprint(selected.device.device_fingerprint)}
                    {selected.device.is_trusted ? '' : ' (chưa tin cậy)'}
                  </dd>
                </div>
                <div>
                  <dt>Vị trí</dt>
                  <dd>
                    {Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)}
                  </dd>
                </div>
                <div>
                  <dt>Độ chính xác GPS</dt>
                  <dd>{selected.gps_accuracy !== null ? `${selected.gps_accuracy} m` : '—'}</dd>
                </div>
                <div>
                  <dt>Vùng chấm công</dt>
                  <dd>{selected.geofence_rule_id ? `#${selected.geofence_rule_id}` : 'Ngoài vùng'}</dd>
                </div>
                <div>
                  <dt>Mức tin cậy</dt>
                  <dd>
                    {selected.fraud_detection?.confidence_score != null
                      ? `${Math.round(selected.fraud_detection.confidence_score * 100)}%`
                      : '—'}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="overview-panel__label" style={{ marginBottom: 6 }}>
                  Dấu hiệu gian lận
                </p>
                <div className="flag-chips">
                  {activeFraudFlagLabels(selected.fraud_detection).length > 0 ? (
                    activeFraudFlagLabels(selected.fraud_detection).map((label) => (
                      <span key={label} className="flag-chip">
                        {label}
                      </span>
                    ))
                  ) : (
                    <span>Không có dấu hiệu bất thường.</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelected(null);
                    setSelectedId(null);
                  }}
                >
                  Giữ từ chối
                </Button>
                <Button onClick={() => setApproveOpen(true)} disabled={selected.status === 'approved'}>
                  Phê duyệt thủ công
                </Button>
              </div>
            </>
          ) : (
            <p>Chọn một lượt chấm công trong danh sách để xem chi tiết và xử lý.</p>
          )}
        </aside>
      </div>

      <Modal title="Phê duyệt thủ công" open={approveOpen} onClose={() => setApproveOpen(false)}>
        <form className="form-grid form-grid--single" onSubmit={handleApprove}>
          <p style={{ margin: 0 }}>
            Phê duyệt lượt chấm công #{selected?.record_id} của {selected?.employee.full_name}? Lượt này sẽ chuyển
            sang trạng thái hợp lệ.
          </p>
          <Input
            label="Ghi chú (không bắt buộc)"
            value={approveNote}
            onChange={(event) => setApproveNote(event.target.value)}
          />
          {approveError ? (
            <p role="alert" style={{ color: '#b91c1c', margin: 0 }}>
              {approveError}
            </p>
          ) : null}
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setApproveOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận phê duyệt'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
