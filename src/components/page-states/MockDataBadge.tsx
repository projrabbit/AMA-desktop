interface MockDataBadgeProps {
  /** Chỉ hiển thị khi đang dùng dữ liệu mẫu (backend không kết nối được). */
  visible: boolean;
}

export function MockDataBadge({ visible }: MockDataBadgeProps) {
  if (!visible) {
    return null;
  }

  return (
    <span className="mock-badge" role="status" title="Không gọi được API nên đang hiển thị dữ liệu mẫu">
      Đang dùng dữ liệu mẫu
    </span>
  );
}
