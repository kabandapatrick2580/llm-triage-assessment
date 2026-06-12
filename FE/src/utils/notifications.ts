import { toast } from "sonner";

/**
 * Thin wrapper around `sonner` toasts so the rest of the app has a single,
 * swappable notification API.
 */
export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description });
  },
  error(message: string, description?: string) {
    toast.error(message, { description });
  },
  info(message: string, description?: string) {
    toast(message, { description });
  },
  warning(message: string, description?: string) {
    toast.warning(message, { description });
  },
  /** Tie a toast lifecycle to a promise (loading -> success / error). */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
  ) {
    return toast.promise(promise, messages);
  },
};
