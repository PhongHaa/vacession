import { useState } from 'react';

/** Quản lý trạng thái loading / error / success cho các thao tác submit form */
export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function run<T>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await action();
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
      return undefined;
    } finally {
      setPending(false);
    }
  }

  return { pending, error, success, run, setError, setSuccess };
}
