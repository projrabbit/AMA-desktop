interface PageStateProps {
  title: string;
  description?: string;
}

export function PageState({ title, description }: PageStateProps) {
  return (
    <section className="page-state" aria-live="polite">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </section>
  );
}

export function LoadingState() {
  return <PageState title="Đang tải dữ liệu..." />;
}

export function EmptyState() {
  return (
    <PageState title="Chưa có dữ liệu" description="Dữ liệu sẽ hiển thị tại đây khi có bản ghi phù hợp." />
  );
}

export function ErrorState() {
  return <PageState title="Không thể tải dữ liệu" description="Vui lòng thử lại sau." />;
}

export function ForbiddenState() {
  return <PageState title="Bạn không có quyền truy cập nội dung này." />;
}

export function NotFoundState() {
  return <PageState title="Không tìm thấy trang." />;
}
