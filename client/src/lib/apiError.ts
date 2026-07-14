export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export async function throwIfNotOk(
  res: Response,
  fallback = 'Request failed',
  opts?: { skipUnauthorized?: boolean }
): Promise<void> {
  if (res.ok) return;
  if (res.status === 401 && !opts?.skipUnauthorized) {
    unauthorizedHandler?.();
  }
  const err = await res.json().catch(() => ({ error: fallback }));
  throw new ApiError(err.error || fallback, res.status);
}

export function errorMessage(err: unknown, fallback = 'Something went wrong') {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
