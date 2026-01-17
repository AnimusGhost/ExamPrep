import { useToast } from '../lib/toast';

const ToastHost = () => {
  const { toasts } = useToast();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-72 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-2xl bg-ink-900/90 px-4 py-3 text-sm text-white shadow-card"
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastHost;
